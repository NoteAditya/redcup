import type { CreatorMetrics } from "@/lib/types";
import { id, nowIso, readDb, updateDb, type Creator, type Db, type InstagramLink, type User } from "@/server/db/store";
import { logAdmin } from "@/server/access";
import type { ExchangedToken, InstagramProfile } from "@/server/integrations/instagram";
import { isProfessional, sealToken } from "@/server/integrations/instagram";

export type InstagramLoginResult =
  | { ok: true; user: User; creator: Creator; created: boolean; linkedExisting: boolean }
  | { ok: false; reason: "deactivated" | "not_creator" };

const normHandle = (h: string) => h.replace(/^@/, "").trim().toLowerCase();

/** Instagram account ids already linked to RedCup creators (helps pick the right shared account). */
export async function knownInstagramIds(): Promise<Set<string>> {
  const db = await readDb();
  return new Set(db.creators.map((c) => c.instagram?.igUserId).filter((x): x is string => Boolean(x)));
}

function linkFrom(profile: InstagramProfile, tok: ExchangedToken, clientBusinessId: string | null, prev?: InstagramLink | null): InstagramLink {
  const at = nowIso();
  return {
    igUserId: profile.igUserId,
    flow: tok.flow,
    username: profile.username,
    name: profile.name,
    accountType: profile.accountType,
    biography: profile.biography,
    website: profile.website,
    followers: profile.followers,
    follows: profile.follows,
    mediaCount: profile.mediaCount,
    profilePictureUrl: profile.profilePictureUrl,
    pictureFetchedAt: profile.profilePictureUrl ? at : null,
    tokenSealed: sealToken(tok.token),
    tokenExpiresAt: tok.expiresAt,
    tokenRefreshedAt: at,
    tokenValid: true,
    clientBusinessId: clientBusinessId ?? prev?.clientBusinessId ?? null,
    connectedAt: prev?.connectedAt ?? at,
    profileRefreshedAt: at,
    linkNote: prev?.linkNote ?? null,
  };
}

/** Copy Instagram's numbers into the eligibility metrics. Only real values; unknowns stay as they were. */
export function applyProfileToMetrics(db: Db, creator: Creator, link: InstagramLink) {
  let m = db.creatorMetrics.find((x) => x.creatorId === creator.id);
  if (!m) {
    m = {
      creatorId: creator.id,
      followers: 0,
      accountType: null,
      accountAgeDays: null,
      mediaCount: 0,
      avgReelViews10: null,
      engagementRate10: null,
      audienceCountryPct: null,
      audienceCityPct: null,
      audienceGenderAge: null,
      niches: creator.categories,
      nicheVerified: [],
      languages: creator.languages,
      city: creator.city || null,
      whatsapp: null,
      pan: null,
      upi: null,
      redcupScore: null,
      onTimeRate: null,
      firstDraftRate: null,
      qualityRating: null,
      fraudFlagsUpheld: 0,
      competitorHistory: [],
      igConnected: false,
      tokenValid: false,
      refreshedAt: nowIso(),
    } satisfies CreatorMetrics;
    db.creatorMetrics.push(m);
  }
  if (link.followers != null) m.followers = link.followers;
  if (link.mediaCount != null) m.mediaCount = link.mediaCount;
  m.accountType = link.accountType;
  m.igConnected = isProfessional(link.accountType);
  m.tokenValid = link.tokenValid;
  m.refreshedAt = nowIso();
}

/**
 * Find or create the creator for an Instagram login.
 * 1. A creator already linked to this Instagram account id → log in.
 * 2. Exactly one older creator (email/Google signup, never linked) whose handle equals the Instagram
 *    username → link it, keep all its data, and leave a note in the activity log and on the profile.
 * 3. Otherwise → new creator account built from the Instagram profile.
 */
export async function completeInstagramLogin(
  profile: InstagramProfile,
  tok: ExchangedToken,
  clientBusinessId: string | null,
): Promise<InstagramLoginResult> {
  return updateDb((db): InstagramLoginResult => {
    let creator = db.creators.find((c) => c.instagram?.igUserId === profile.igUserId) ?? null;
    let created = false;
    let linkedExisting = false;

    if (!creator) {
      const matches = db.creators.filter((c) => !c.instagram && normHandle(c.handle) === normHandle(profile.username));
      if (matches.length === 1) {
        creator = matches[0];
        linkedExisting = true;
      }
    }

    if (creator) {
      const user = db.users.find((u) => u.id === creator!.userId);
      if (!user) return { ok: false, reason: "not_creator" };
      if (user.role !== "creator") return { ok: false, reason: "not_creator" };
      if (user.status === "inactive") return { ok: false, reason: "deactivated" };
      const link = linkFrom(profile, tok, clientBusinessId, creator.instagram);
      if (linkedExisting) {
        const how = user.clerkId ? "Google" : user.email ? "email" : "phone";
        link.linkNote = `Linked on first Instagram login: @${profile.username} matched the handle on this ${how} account created ${user.createdAt.slice(0, 10)}.`;
        logAdmin(db, {
          adminId: "system:instagram",
          action: "creator_instagram_link",
          targetType: "creator",
          targetId: creator.id,
          reason: "Handle matched on first Instagram login",
          details: `${creator.displayName}: @${creator.handle} → Instagram @${profile.username} (${profile.igUserId})`,
        });
      }
      creator.instagram = link;
      creator.handle = normHandle(profile.username);
      if (!creator.displayName) creator.displayName = profile.name || profile.username;
      applyProfileToMetrics(db, creator, link);
      return { ok: true, user, creator, created, linkedExisting };
    }

    const userId = id("usr");
    const name = profile.name || profile.username;
    const user: User = {
      id: userId,
      role: "creator",
      email: null,
      phone: null,
      name,
      status: "active",
      createdAt: nowIso(),
    };
    db.users.push(user);
    creator = {
      id: id("cr"),
      userId,
      displayName: name,
      handle: normHandle(profile.username),
      city: "",
      languages: [],
      categories: [],
      level: "listed",
      panMasked: null,
      upiMasked: null,
      createdAt: nowIso(),
      instagram: linkFrom(profile, tok, clientBusinessId),
    };
    db.creators.push(creator);
    applyProfileToMetrics(db, creator, creator.instagram!);
    created = true;
    return { ok: true, user, creator, created, linkedExisting };
  });
}
