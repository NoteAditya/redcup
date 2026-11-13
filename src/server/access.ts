import type { CampaignApproval } from "@/lib/types";
import { evaluate } from "@/server/eligibility/evaluate";
import { id, nowIso, type Application, type Brand, type Campaign, type Db } from "@/server/db/store";

/** Applications a brand may see or act on: only ones RedCup has approved. */
export function isAdminApproved(a: Application): boolean {
  return (a.reviewStatus ?? (a.status === "APPLIED" ? "pending" : "approved")) === "approved";
}

export function brandVisibleApplications(db: Db, campaignId: string): Application[] {
  return db.applications.filter((a) => a.campaignId === campaignId && isAdminApproved(a));
}

export function campaignApproval(c: Campaign): CampaignApproval {
  return c.approvalStatus ?? (c.status === "draft" || c.status === "verifying" ? "pending" : "approved");
}

export function isBrandApproved(brand: Brand | null | undefined): boolean {
  return brand?.kycStatus === "approved";
}

/** Brand-facing label for a campaign that is still waiting on RedCup. */
export function brandCampaignLabel(c: Campaign): string {
  const ap = campaignApproval(c);
  if (ap === "pending") return c.fundedAt ? "pending approval" : "draft · pending approval";
  if (ap === "changes_requested") return "changes requested";
  if (ap === "rejected") return "rejected";
  if (c.status === "draft") return "approved · fund to go live";
  return c.status;
}

export function logAdmin(
  db: Db,
  entry: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string | null;
    details?: string | null;
  },
) {
  db.adminActions.push({
    id: id("aa"),
    adminId: entry.adminId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    reason: entry.reason?.trim() || "",
    details: entry.details ?? null,
    createdAt: nowIso(),
  });
}

/** Recompute eligibility rows for one campaign (after go-live or criteria edits). */
export function recomputeEligibility(db: Db, c: Campaign) {
  db.eligibility = db.eligibility.filter((e) => e.campaignId !== c.id);
  const at = nowIso();
  for (const m of db.creatorMetrics) {
    const result = evaluate(m, c.criteria);
    db.eligibility.push({
      campaignId: c.id,
      creatorId: m.creatorId,
      status: result.status,
      reasons: result.reasons,
      computedAt: at,
    });
  }
}
