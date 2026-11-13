import { nowIso, type Creator, type Db } from "@/server/db/store";
import { logAdmin } from "@/server/access";

/**
 * Remove the Instagram data RedCup holds for one creator: token, profile details, picture link,
 * and the Instagram-derived numbers in their metrics. The creator account and campaign history
 * (needed for payouts and tax records) stay; the account can no longer log in until Instagram is
 * connected again. Returns the creator id that was erased, or null.
 */
export function eraseCreatorInstagram(db: Db, match: (c: Creator) => boolean): string | null {
  const creator = db.creators.find(match);
  if (!creator?.instagram) return null;
  const username = creator.instagram.username;
  creator.instagram = null;
  const m = db.creatorMetrics.find((x) => x.creatorId === creator.id);
  if (m) {
    m.igConnected = false;
    m.tokenValid = false;
    m.accountType = null;
    m.refreshedAt = nowIso();
  }
  logAdmin(db, {
    adminId: "system:meta-deletion",
    action: "creator_instagram_erase",
    targetType: "creator",
    targetId: creator.id,
    reason: "Instagram data deletion request",
    details: `Erased Instagram token and profile for @${username}`,
  });
  return creator.id;
}
