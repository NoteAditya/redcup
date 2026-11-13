import { createHmac, timingSafeEqual } from "crypto";
import type { InstagramFlow, InstagramLink } from "@/server/db/store";
import { open, seal } from "@/server/crypto/secretbox";

/**
 * Instagram for RedCup creators.
 *
 * The RedCup Meta app is a newer app on "Instagram API with Unified Login": the app ID is the
 * Meta (Facebook) app ID, permissions come from a Facebook Login for Business configuration
 * (INSTAGRAM_CONFIG_ID), the dialog lives at facebook.com/dialog/oauth, the code is exchanged on
 * graph.facebook.com and Instagram accounts are discovered with /me/assigned_instagram_accounts.
 *
 * The older "Instagram API with Instagram Login" flow (instagram.com/oauth/authorize,
 * graph.instagram.com, 60-day refreshable tokens) is kept behind INSTAGRAM_LOGIN_FLOW=instagram
 * for apps that still have an Instagram app ID.
 *
 * Tokens never leave the server and are never put in error messages or logs.
 */

export type InstagramConfig = {
  appId: string;
  appSecret: string;
  configId: string | null;
  flow: InstagramFlow;
  graphVersion: string;
};

export function instagramConfig(): InstagramConfig | null {
  const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "";
  const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || "";
  if (!appId || !appSecret) return null;
  const configId = process.env.INSTAGRAM_CONFIG_ID || null;
  const forced = process.env.INSTAGRAM_LOGIN_FLOW;
  const flow: InstagramFlow =
    forced === "instagram" || forced === "unified" ? forced : configId ? "unified" : "instagram";
  if (flow === "unified" && !configId) return null;
  return { appId, appSecret, configId, flow, graphVersion: process.env.META_GRAPH_VERSION || "v24.0" };
}

export function instagramConnectState() {
  const ready = Boolean(instagramConfig());
  return {
    ready,
    message: ready
      ? undefined
      : "Instagram login is not configured (INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_CONFIG_ID). Admins can still enter views by hand.",
  };
}

/**
 * Same value for the authorize call and the code exchange, and it must be registered in Meta.
 * INSTAGRAM_REDIRECT_URI wins, then APP_URL (the site's public URL), then the request origin.
 */
export function instagramRedirectUri(origin: string): string {
  if (process.env.INSTAGRAM_REDIRECT_URI) return process.env.INSTAGRAM_REDIRECT_URI;
  const base = process.env.APP_URL || origin;
  return `${base.replace(/\/$/, "")}/api/auth/instagram/callback`;
}

export const INSTAGRAM_LOGIN_SCOPES = ["instagram_business_basic", "instagram_business_manage_insights"];

export function instagramAuthUrl(state: string, redirectUri: string, cfg = instagramConfig()): string | null {
  if (!cfg) return null;
  if (cfg.flow === "unified") {
    // Permissions and assets come from the saved configuration, so no scope parameter.
    const params = new URLSearchParams({
      client_id: cfg.appId,
      config_id: cfg.configId!,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    });
    return `https://www.facebook.com/${cfg.graphVersion}/dialog/oauth?${params}`;
  }
  const params = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: INSTAGRAM_LOGIN_SCOPES.join(","),
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

/* ----------------------------------------------------------------- HTTP */

export class InstagramError extends Error {
  constructor(
    public code: "config" | "exchange" | "graph" | "no_accounts" | "multiple_accounts" | "personal" | "token" | "not_found" | "no_insights",
    message: string,
    public graphCode?: number,
  ) {
    super(message);
  }
}

function graphHost(flow: InstagramFlow, cfg: InstagramConfig) {
  return flow === "unified" ? `https://graph.facebook.com/${cfg.graphVersion}` : "https://graph.instagram.com";
}

function appSecretProof(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

async function graphGet<T = Record<string, unknown>>(
  cfg: InstagramConfig,
  flow: InstagramFlow,
  token: string,
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${graphHost(flow, cfg)}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token);
  if (flow === "unified") url.searchParams.set("appsecret_proof", appSecretProof(token, cfg.appSecret));
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
  } catch {
    throw new InstagramError("graph", "Could not reach Instagram. Try again.");
  }
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } } & T;
  if (!res.ok || body.error) {
    const code = body.error?.code;
    // 190 = invalid/expired token
    throw new InstagramError(code === 190 ? "token" : "graph", sanitize(body.error?.message) || `Instagram returned ${res.status}.`, code);
  }
  return body;
}

/** Meta error messages can echo request parts; drop anything that looks like a token. */
function sanitize(msg: string | undefined) {
  return (msg || "").replace(/[A-Za-z0-9_\-|]{40,}/g, "[redacted]").slice(0, 300);
}

/* ------------------------------------------------------------ Token flow */

export type ExchangedToken = { token: string; expiresAt: string | null; flow: InstagramFlow };

export async function exchangeCode(code: string, redirectUri: string, cfg = instagramConfig()): Promise<ExchangedToken> {
  if (!cfg) throw new InstagramError("config", "Instagram login is not configured.");
  if (cfg.flow === "unified") {
    const url = new URL(`https://graph.facebook.com/${cfg.graphVersion}/oauth/access_token`);
    url.search = new URLSearchParams({
      client_id: cfg.appId,
      client_secret: cfg.appSecret,
      redirect_uri: redirectUri,
      code,
    }).toString();
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" }).catch(() => null);
    const body = (await res?.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
    if (!res?.ok || !body?.access_token) {
      throw new InstagramError("exchange", sanitize(body?.error?.message) || "Instagram did not accept the login code.");
    }
    return { token: body.access_token, expiresAt: expiry(body.expires_in), flow: "unified" };
  }

  // Instagram Login: short-lived token, then a 60-day long-lived token.
  const form = new URLSearchParams({
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  }).catch(() => null);
  const short = (await res?.json().catch(() => ({}))) as { access_token?: string; error_message?: string };
  if (!res?.ok || !short?.access_token) {
    throw new InstagramError("exchange", sanitize(short?.error_message) || "Instagram did not accept the login code.");
  }
  const long = await graphGet<{ access_token?: string; expires_in?: number }>(cfg, "instagram", short.access_token, "access_token", {
    grant_type: "ig_exchange_token",
    client_secret: cfg.appSecret,
  });
  if (!long.access_token) throw new InstagramError("exchange", "Instagram did not return a long-lived token.");
  return { token: long.access_token, expiresAt: expiry(long.expires_in), flow: "instagram" };
}

function expiry(seconds: number | undefined): string | null {
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
    ? new Date(Date.now() + seconds * 1000).toISOString()
    : null;
}

/* --------------------------------------------------------------- Profile */

export type InstagramProfile = {
  igUserId: string;
  username: string;
  name: string | null;
  accountType: InstagramLink["accountType"];
  biography: string | null;
  website: string | null;
  followers: number | null;
  follows: number | null;
  mediaCount: number | null;
  profilePictureUrl: string | null;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

function mapAccountType(v: unknown): InstagramLink["accountType"] {
  if (v === "BUSINESS") return "BUSINESS";
  if (v === "MEDIA_CREATOR" || v === "CREATOR") return "CREATOR";
  if (v === "PERSONAL") return "PERSONAL";
  return null;
}

/**
 * Which Instagram account this login is for.
 * Unified Login: the accounts the creator shared from their business portfolio. We need exactly one
 * (or one that is already linked to a RedCup creator). Instagram Login: the account that signed in.
 */
export async function resolveAccount(
  token: string,
  flow: InstagramFlow,
  knownIds: Set<string>,
  cfg = instagramConfig(),
): Promise<{ igUserId: string; clientBusinessId: string | null }> {
  if (!cfg) throw new InstagramError("config", "Instagram login is not configured.");
  if (flow === "instagram") {
    const me = await graphGet<{ user_id?: string | number; id?: string }>(cfg, flow, token, "me", { fields: "user_id" });
    const igUserId = String(me.user_id ?? me.id ?? "");
    if (!igUserId) throw new InstagramError("no_accounts", "Instagram did not return an account.");
    return { igUserId, clientBusinessId: null };
  }
  const ids: string[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const res = await graphGet<{ data?: { id?: string | number }[]; paging?: { cursors?: { after?: string } } }>(
      cfg,
      flow,
      token,
      "me/assigned_instagram_accounts",
      { fields: "id,username", ...(after ? { after } : {}) },
    );
    const data = Array.isArray(res.data) ? res.data : [];
    for (const a of data) if (a.id != null) ids.push(String(a.id));
    const next = res.paging?.cursors?.after;
    if (!data.length || !next || next === after) break;
    after = next;
  }
  if (!ids.length) {
    throw new InstagramError(
      "no_accounts",
      "No Instagram professional account was shared. Instagram only allows Creator or Business accounts here.",
    );
  }
  const known = ids.find((x) => knownIds.has(x));
  if (known) return { igUserId: known, clientBusinessId: await businessId(cfg, token) };
  if (ids.length > 1) {
    throw new InstagramError("multiple_accounts", "More than one Instagram account was shared. Log in again and share only your own account.");
  }
  return { igUserId: ids[0], clientBusinessId: await businessId(cfg, token) };
}

async function businessId(cfg: InstagramConfig, token: string): Promise<string | null> {
  try {
    const me = await graphGet<{ client_business_id?: string }>(cfg, "unified", token, "me", { fields: "client_business_id" });
    return me.client_business_id ?? null;
  } catch {
    return null;
  }
}

export async function fetchProfile(token: string, flow: InstagramFlow, igUserId: string, cfg = instagramConfig()): Promise<InstagramProfile> {
  if (!cfg) throw new InstagramError("config", "Instagram login is not configured.");
  const base =
    flow === "unified"
      ? ["id", "username", "name", "profile_picture_url", "followers_count", "follows_count", "media_count"]
      : ["user_id", "username", "name", "account_type", "profile_picture_url", "followers_count", "follows_count", "media_count"];
  const extra = ["biography", "website"];
  const path = flow === "unified" ? igUserId : "me";
  let raw: Record<string, unknown>;
  try {
    raw = await graphGet(cfg, flow, token, path, { fields: [...base, ...extra].join(",") });
  } catch (e) {
    // Some account types / API versions reject biography or website; retry with the core fields.
    if (e instanceof InstagramError && e.code === "graph") raw = await graphGet(cfg, flow, token, path, { fields: base.join(",") });
    else throw e;
  }
  const username = str(raw.username);
  if (!username) throw new InstagramError("graph", "Instagram did not return a username.");
  return {
    igUserId,
    username,
    name: str(raw.name),
    // Unified Login only ever shares professional accounts but does not say which kind.
    accountType: flow === "unified" ? "PROFESSIONAL" : mapAccountType(raw.account_type),
    biography: str(raw.biography),
    website: str(raw.website),
    followers: num(raw.followers_count),
    follows: num(raw.follows_count),
    mediaCount: num(raw.media_count),
    profilePictureUrl: str(raw.profile_picture_url),
  };
}

export function isProfessional(t: InstagramLink["accountType"]) {
  return t === "BUSINESS" || t === "CREATOR" || t === "PROFESSIONAL";
}

/* ------------------------------------------------------- Stored tokens */

export function sealToken(token: string) {
  return seal(token);
}

/** Decrypt the stored token, or null when missing, expired or sealed with an old key. */
export function storedToken(link: InstagramLink | null | undefined): string | null {
  if (!link?.tokenSealed || !link.tokenValid) return null;
  if (link.tokenExpiresAt && Date.parse(link.tokenExpiresAt) <= Date.now()) return null;
  return open(link.tokenSealed);
}

/**
 * Keep the token alive. Instagram Login tokens last 60 days and can be refreshed once they are
 * 24h old; we refresh when fewer than 15 days remain. Unified Login tokens have the lifetime set
 * in the Meta configuration and cannot be refreshed here; the creator logs in again when one expires.
 * Returns the fields to merge into the link, or null when nothing changed.
 */
export async function refreshTokenIfDue(link: InstagramLink, cfg = instagramConfig()): Promise<Partial<InstagramLink> | null> {
  if (!cfg) return null;
  if (link.tokenExpiresAt && Date.parse(link.tokenExpiresAt) <= Date.now()) return { tokenValid: false };
  if (link.flow !== "instagram" || !link.tokenExpiresAt) return null;
  const left = Date.parse(link.tokenExpiresAt) - Date.now();
  const age = Date.now() - Date.parse(link.tokenRefreshedAt || link.connectedAt);
  if (left > 15 * 86_400_000 || age < 86_400_000) return null;
  const token = storedToken(link);
  if (!token) return { tokenValid: false };
  try {
    const res = await graphGet<{ access_token?: string; expires_in?: number }>(cfg, "instagram", token, "refresh_access_token", {
      grant_type: "ig_refresh_token",
    });
    if (!res.access_token) return null;
    return { tokenSealed: seal(res.access_token), tokenExpiresAt: expiry(res.expires_in), tokenRefreshedAt: new Date().toISOString(), tokenValid: true };
  } catch (e) {
    if (e instanceof InstagramError && e.code === "token") return { tokenValid: false };
    return null;
  }
}

/** Fresh profile picture URL (and counts) using the stored token. */
export async function refreshProfile(link: InstagramLink, cfg = instagramConfig()): Promise<InstagramProfile | null> {
  const token = storedToken(link);
  if (!token || !cfg) return null;
  return fetchProfile(token, link.flow, link.igUserId, cfg);
}

/* --------------------------------------------------------- Reel insights */

/** Instagram shortcode from a post/reel URL, for matching permalinks. */
export function shortcodeFromPermalink(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

/** Find a media id on the creator's account by its permalink (looks at the latest ~200 posts). */
export async function findMediaId(link: InstagramLink, permalink: string, cfg = instagramConfig()): Promise<string> {
  const token = storedToken(link);
  if (!token || !cfg) throw new InstagramError("token", "The creator's Instagram login has expired. Ask them to log in again.");
  const want = shortcodeFromPermalink(permalink);
  if (!want) throw new InstagramError("not_found", "That does not look like an Instagram reel link.");
  const path = link.flow === "unified" ? `${link.igUserId}/media` : "me/media";
  let after: string | undefined;
  for (let page = 0; page < 4; page++) {
    const res = await graphGet<{ data?: { id: string; permalink?: string }[]; paging?: { cursors?: { after?: string }; next?: string } }>(
      cfg,
      link.flow,
      token,
      path,
      { fields: "id,permalink,media_product_type", limit: "50", ...(after ? { after } : {}) },
    );
    for (const m of res.data ?? []) {
      if (m.permalink && shortcodeFromPermalink(m.permalink) === want) return m.id;
    }
    after = res.paging?.cursors?.after;
    if (!after || !res.paging?.next) break;
  }
  throw new InstagramError("not_found", "Couldn't find that reel on the creator's Instagram account.");
}

/** Views for one reel, from Instagram insights. */
export async function fetchReelViews(
  link: InstagramLink,
  ref: { mediaId?: string; permalink?: string },
  cfg = instagramConfig(),
): Promise<{ mediaId: string; views: number }> {
  const token = storedToken(link);
  if (!token || !cfg) throw new InstagramError("token", "The creator's Instagram login has expired. Ask them to log in again.");
  const mediaId = ref.mediaId || (ref.permalink ? await findMediaId(link, ref.permalink, cfg) : "");
  if (!mediaId) throw new InstagramError("not_found", "No reel to look up.");
  const res = await graphGet<{ data?: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(
    cfg,
    link.flow,
    token,
    `${mediaId}/insights`,
    { metric: "views" },
  ).catch((e: unknown) => {
    if (e instanceof InstagramError && e.code === "graph") {
      throw new InstagramError("no_insights", "Instagram didn't share views for this reel (insights permission missing or reel too new).");
    }
    throw e;
  });
  const row = res.data?.find((d) => d.name === "views");
  const views = row?.total_value?.value ?? row?.values?.[0]?.value;
  if (typeof views !== "number") throw new InstagramError("no_insights", "Instagram returned no view count for this reel.");
  return { mediaId, views };
}

/* ------------------------------------------------- Meta data deletion */

/** Verify and decode Meta's signed_request (HMAC-SHA256 with the app secret). */
export function parseSignedRequest(signed: string, secret: string): { user_id?: string; [k: string]: unknown } | null {
  const [sig, payload] = (signed || "").split(".");
  if (!sig || !payload) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    if (data?.algorithm && String(data.algorithm).toUpperCase() !== "HMAC-SHA256") return null;
    return data;
  } catch {
    return null;
  }
}
