import { nowIso, readDb, updateDb, type Creator, type InstagramLink } from "@/server/db/store";
import { applyProfileToMetrics } from "@/server/auth/instagram-login";
import { InstagramError, refreshProfile, refreshTokenIfDue } from "@/server/integrations/instagram";

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
    }
    applyProfileToMetrics(d, c, c.instagram);
    return c.instagram;
  });
}
