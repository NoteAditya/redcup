import type { CreatorMetrics } from "@/lib/types";
import type { Creator, Db } from "@/server/db/store";
import { creatorOnboarded } from "@/lib/profile";

export type ExploreSort = "followers" | "engagement" | "views";

export type ExploreRow = { creator: Creator; metrics: CreatorMetrics | null; topViews: number | null };

/**
 * Creators brands can discover: active accounts that finished onboarding and logged in with
 * Instagram (so every number is Instagram's). No contact details or payout data leave this function's callers.
 */
export function exploreCreators(db: Db, opts: { niche?: string | null; sort?: ExploreSort; includeQa?: boolean } = {}): ExploreRow[] {
  const users = new Map(db.users.map((u) => [u.id, u]));
  const metrics = new Map(db.creatorMetrics.map((m) => [m.creatorId, m]));
  const niche = opts.niche?.trim().toLowerCase() || null;
  const rows: ExploreRow[] = [];
  for (const c of db.creators) {
    const u = users.get(c.userId);
    if (!u || u.status !== "active" || u.role !== "creator") continue;
    // Throwaway QA accounts never show up for real brands.
    if (u.email?.endsWith("@redcup.test") && !opts.includeQa) continue;
    if (!c.instagram || !creatorOnboarded(c)) continue;
    if (niche && !c.categories.some((x) => x.toLowerCase() === niche)) continue;
    const views = (c.instagram.topReels ?? []).map((r) => r.views).filter((v): v is number => typeof v === "number");
    rows.push({ creator: c, metrics: metrics.get(c.id) ?? null, topViews: views.length ? Math.max(...views) : null });
  }
  const followers = (r: ExploreRow) => r.creator.instagram?.followers ?? r.metrics?.followers ?? -1;
  const er = (r: ExploreRow) => r.metrics?.engagementRate10 ?? -1;
  const views = (r: ExploreRow) => r.topViews ?? -1;
  const sort = opts.sort ?? "followers";
  const key = sort === "engagement" ? er : sort === "views" ? views : followers;
  // A niche match listed first on the creator's profile ranks above a secondary one.
  const primary = (r: ExploreRow) => (niche && r.creator.categories[0]?.toLowerCase() === niche ? 1 : 0);
  return rows.sort((a, b) => key(b) - key(a) || followers(b) - followers(a) || primary(b) - primary(a));
}
