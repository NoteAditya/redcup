import type { Db } from "@/server/db/store";
import type { AppRow } from "@/components/admin/AdminActions";
import { campaignApproval } from "@/server/access";

export function appRows(db: Db, apps: Db["applications"]): AppRow[] {
  const creators = new Map(db.creators.map((c) => [c.id, c]));
  const metrics = new Map(db.creatorMetrics.map((m) => [m.creatorId, m]));
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));
  return apps.map((a) => {
    const cr = creators.get(a.creatorId);
    const m = metrics.get(a.creatorId) ?? a.metricsSnapshot;
    return {
      id: a.id,
      creatorId: a.creatorId,
      creatorName: cr?.displayName ?? a.creatorId,
      handle: cr?.handle ?? "",
      followers: m?.followers ?? null,
      niches: (m?.niches?.length ? m.niches : cr?.categories ?? []).join(", "),
      fit: a.fitScore,
      status: a.status,
      review: a.reviewStatus ?? "pending",
      reviewNote: a.reviewNote ?? null,
      campaignId: a.campaignId,
      campaignTitle: campaigns.get(a.campaignId)?.title ?? a.campaignId,
      appliedAt: a.appliedAt,
    };
  });
}

export function pendingCounts(db: Db) {
  return {
    applications: db.applications.filter((a) => (a.reviewStatus ?? "pending") === "pending").length,
    campaigns: db.campaigns.filter((c) => campaignApproval(c) === "pending").length,
    brands: db.brands.filter((b) => b.kycStatus === "submitted").length,
  };
}

/** Bucket ISO timestamps into the last `days` IST calendar days. */
export function dailySeries(dates: string[], days = 30) {
  const dayKey = (t: number) => new Date(t + 330 * 60_000).toISOString().slice(0, 10);
  const now = Date.now();
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(now - i * 86400000));
  const counts = new Map(keys.map((k) => [k, 0]));
  for (const d of dates) {
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) continue;
    const k = dayKey(t);
    if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1);
  }
  return keys.map((k) => ({ day: k, value: counts.get(k) || 0 }));
}

export function countBy<T>(items: T[], key: (t: T) => string) {
  const out: Record<string, number> = {};
  for (const i of items) out[key(i)] = (out[key(i)] || 0) + 1;
  return Object.entries(out)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
}

export function userName(db: Db, userId: string) {
  if (userId.startsWith("system")) return "RedCup (automatic)";
  return db.users.find((u) => u.id === userId)?.name ?? userId;
}

/** Human label + link for an activity-log target. */
export function targetInfo(db: Db, type: string, targetId: string): { label: string; href: string | null } {
  if (type === "brand") {
    const b = db.brands.find((x) => x.id === targetId);
    return { label: b?.businessName ?? targetId, href: b ? "/admin/users/" + b.userId : null };
  }
  if (type === "campaign") {
    const c = db.campaigns.find((x) => x.id === targetId);
    return { label: c?.title ?? targetId, href: c ? "/admin/bounties/" + c.id : null };
  }
  if (type === "application") {
    const a = db.applications.find((x) => x.id === targetId);
    const c = a ? db.campaigns.find((x) => x.id === a.campaignId) : null;
    const cr = a ? db.creators.find((x) => x.id === a.creatorId) : null;
    return {
      label: a ? `${cr?.displayName ?? "Creator"} → ${c?.title ?? "campaign"}` : targetId,
      href: c ? "/admin/bounties/" + c.id : null,
    };
  }
  if (type === "creator") {
    const cr = db.creators.find((x) => x.id === targetId);
    return { label: cr ? `${cr.displayName} (@${cr.handle})` : targetId, href: cr ? "/admin/creators/" + cr.id : null };
  }
  if (type === "user") {
    const u = db.users.find((x) => x.id === targetId);
    return { label: u?.name ?? targetId, href: u ? "/admin/users/" + u.id : null };
  }
  return { label: targetId, href: null };
}
