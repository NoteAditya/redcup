import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getIronSessionHandle } from "@/server/auth/session";
import { completeInstagramLogin, knownInstagramIds } from "@/server/auth/instagram-login";
import {
  InstagramError,
  exchangeCode,
  fetchProfile,
  instagramConfig,
  instagramRedirectUri,
  isProfessional,
  resolveAccount,
} from "@/server/integrations/instagram";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "redcup_ig_state";

function back(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.nextUrl.origin));
}

function sameState(a: string | undefined, b: string | null) {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (sp.get("error") || sp.get("error_reason")) return back(req, "/login?ig_error=cancelled");
  if (!sameState(expected, sp.get("state"))) return back(req, "/login?ig_error=state");
  const code = sp.get("code");
  if (!code) return back(req, "/login?ig_error=cancelled");

  const cfg = instagramConfig();
  if (!cfg) return back(req, "/login?ig_error=config");

  try {
    const tok = await exchangeCode(code, instagramRedirectUri(req.nextUrl.origin), cfg);
    const account = await resolveAccount(tok.token, tok.flow, await knownInstagramIds(), cfg);
    const profile = await fetchProfile(tok.token, tok.flow, account.igUserId, cfg);
    if (!isProfessional(profile.accountType)) return back(req, "/login?ig_error=personal");

    const result = await completeInstagramLogin(profile, tok, account.clientBusinessId);
    if (!result.ok) {
      return back(req, result.reason === "deactivated" ? "/login?deactivated=1" : "/login?ig_error=not_creator");
    }

    const session = await getIronSessionHandle();
    session.userId = result.user.id;
    session.role = "creator";
    session.name = result.user.name;
    session.isLoggedIn = true;
    session.via = "instagram";
    session.needsRole = undefined;
    await session.save();

    const needsSetup = !result.creator.city || !result.creator.categories.length;
    return back(req, needsSetup ? "/creator/onboarding" : "/creator");
  } catch (e) {
    const code = e instanceof InstagramError ? e.code : "graph";
    // Log the category only; never the code, token or Meta's raw response.
    console.error("[instagram-login] failed:", code);
    const map: Record<string, string> = {
      no_accounts: "no_accounts",
      multiple_accounts: "multiple_accounts",
      personal: "personal",
      exchange: "exchange",
      config: "config",
    };
    return back(req, `/login?ig_error=${map[code] ?? "failed"}`);
  }
}
