import { nowIso, readDb, updateDb, type Creator, type InstagramLink } from "@/server/db/store";
import { applyProfileToMetrics } from "@/server/auth/instagram-login";
import { InstagramError, fetchAudience, fetchTopReels, refreshProfile, refreshTokenIfDue, storedToken } from "@/server/integrations/instagram";

/** Profile picture URLs from Meta expire after a while; refetch once they are this old. */
export const PICTURE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Refresh a creator's token (when due) and Instagram profile using the stored token.
 * Safe to call often: it does nothing unless the picture is stale or `force` is set.
 */
export async function syncCreatorInstagram(creatorId: string, opts: { force?: boolean } = {}): Promise<InstagramLink | null> {
  const db = await readDb();
  const creator = db.creators.find((c) => c.id === creatorId);
  const link = creator?.instagram;
  if (!creator || !link) return null;
  const stale = !link.pictureFetchedAt || Date.now() - Date.parse(link.pictureFetchedAt) > PICTURE_MAX_AGE_MS;
  if (!opts.force && !stale) return link;

  const tokenPatch = await refreshTokenIfDue(link);
  const working: InstagramLink = { ...link, ...(tokenPatch ?? {}) };
  let profile = null;
  let invalid = false;
  try {
    profile = await refreshProfile(working);
  } catch (e) {
    if (e instanceof InstagramError && e.code === "token") invalid = true;
  }
  // Demographics change slowly; refresh them at most once a day alongside the profile.
  const audienceDue = !link.profileRefreshedAt || Date.now() - Date.parse(link.profileRefreshedAt) > 86_400_000;
  const token = profile && audienceDue ? storedToken(working) : null;
  const audience = token ? await fetchAudience(token, working.flow, working.igUserId).catch(() => null) : null;
  if (!tokenPatch && !profile && !invalid) return link;

  return updateDb((d) => {
    const c: Creator | undefined = d.creators.find((x) => x.id === creatorId);
    if (!c?.instagram) return null;
    Object.assign(c.instagram, tokenPatch ?? {});
    if (invalid) c.instagram.tokenValid = false;
    if (profile) {
      const at = nowIso();
      Object.assign(c.instagram, {
        username: profile.username,
        name: profile.name,
        accountType: profile.accountType ?? c.instagram.accountType,
        biography: profile.biography,
        website: profile.website,
        followers: profile.followers,
        follows: profile.follows,
        mediaCount: profile.mediaCount,
        profilePictureUrl: profile.profilePictureUrl,
        pictureFetchedAt: at,
        profileRefreshedAt: at,
      });
      if (audience && (audience.countryPct || audience.cityPct || audience.genderPct)) c.instagram.audience = audience;
    }
    applyProfileToMetrics(d, c, c.instagram);
    return c.instagram;
  });
}

/** Top reels are cached on the creator and refreshed at most this often (plus on every Instagram login). */
export const TOP_REELS_MAX_AGE_MS = 6 * 60 * 60 * 1000;
/** After a failed refresh, wait this long before trying Instagram again. */
const TOP_REELS_RETRY_MS = 15 * 60 * 1000;

export function topReelsStale(link: InstagramLink | null | undefined): boolean {
  if (!link) return false;
  if (!link.topReelsFetchedAt) return true;
  const age = Date.now() - Date.parse(link.topReelsFetchedAt);
  const ok = link.topReelsStatus === "ok" || link.topReelsStatus === "no_reels" || link.topReelsStatus === "no_insights";
  return age > (ok ? TOP_REELS_MAX_AGE_MS : TOP_REELS_RETRY_MS);
}

/**
 * Refresh the cached top reels for a creator when stale (or forced, e.g. on login).
 * A failed refresh keeps the previous reels; a missing token is recorded so the UI can say why.
 */
export async function syncTopReels(creatorId: string, opts: { force?: boolean } = {}): Promise<InstagramLink | null> {
  const db = await readDb();
  const link = db.creators.find((c) => c.id === creatorId)?.instagram;
  if (!link) return null;
  if (!opts.force && !topReelsStale(link)) return link;
  const res = await fetchTopReels(link);
  return updateDb((d) => {
    const c = d.creators.find((x) => x.id === creatorId);
    if (!c?.instagram) return null;
    c.instagram.topReelsFetchedAt = nowIso();
    c.instagram.topReelsStatus = res.status;
    if (res.status === "ok" || res.status === "no_insights" || res.status === "no_reels") c.instagram.topReels = res.reels;
    else if (res.status === "no_token" && !c.instagram.topReels) c.instagram.topReels = [];
    return c.instagram;
  });
}
