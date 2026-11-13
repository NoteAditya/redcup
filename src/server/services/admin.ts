"use server";

import { requireUser } from "@/server/auth/session";
import { creatorPayout, performanceEarning } from "@/lib/money";
import { slugify } from "@/lib/format";
import { MIN_BOUNTY_BUDGET_PAISE } from "@/lib/pricing";
import type { CampaignCriteria, CampaignStatus } from "@/lib/types";
import { id, nowIso, readDb, updateDb, type Campaign } from "@/server/db/store";
import { campaignApproval, logAdmin, recomputeEligibility } from "@/server/access";
import { sendApplicationNotice } from "@/server/integrations/mail";
import { brandHasGst } from "@/lib/profile";

type Result = { ok: true } | { ok: false; error: string };

function clean(s: string | null | undefined): string {
  return (s || "").trim().slice(0, 1000);
}

/* ---------------------------------------------------------------- Brands */

/**
 * Approve or reject a brand account. Rejection needs a typed reason.
 * A brand without a GSTIN can only be approved with an explicit admin override and a reason,
 * which is logged as "brand_approve_gst_override".
 */
export async function reviewBrand(
  brandId: string,
  approve: boolean,
  reason: string,
  opts: { overrideGst?: boolean } = {},
): Promise<Result> {
  const session = await requireUser(["admin"]);
  const note = clean(reason);
  if (!approve && !note) return { ok: false, error: "Type a reason for the rejection." };
  return updateDb((db): Result => {
    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) return { ok: false, error: "Brand not found." };
    const gstMissing = !brandHasGst(brand);
    if (approve && gstMissing) {
      if (!opts.overrideGst) {
        return { ok: false, error: "This brand hasn't added a GSTIN. Tick \"Approve without GST\" and type a reason to override." };
      }
      if (!note) return { ok: false, error: "Type a reason for approving without a GSTIN." };
    }
    const before = brand.kycStatus;
    brand.kycStatus = approve ? "approved" : "rejected";
    brand.kycNote = note || null;
    brand.kycReviewedAt = nowIso();
    const override = approve && gstMissing;
    logAdmin(db, {
      adminId: session.userId,
      action: approve ? (override ? "brand_approve_gst_override" : "brand_approve") : "brand_reject",
      targetType: "brand",
      targetId: brandId,
      reason: note,
      details: `${brand.businessName}: ${before} → ${brand.kycStatus}${override ? " · approved without GSTIN (admin override)" : ""}`,
    });
    return { ok: true };
  });
}

/** @deprecated kept for older callers; same as reviewBrand. */
export async function approveBrandKyc(brandId: string, approve: boolean, reason: string) {
  return reviewBrand(brandId, approve, reason);
}

/* ------------------------------------------------------------- Campaigns */

export async function reviewCampaign(
  campaignId: string,
  decision: "approve" | "reject" | "changes",
  note: string,
): Promise<Result> {
  const session = await requireUser(["admin"]);
  const text = clean(note);
  if (decision !== "approve" && !text) return { ok: false, error: "Type a note for the brand." };
  return updateDb((db): Result => {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return { ok: false, error: "Campaign not found." };
    const beforeStatus = c.status;
    const beforeApproval = campaignApproval(c);
    c.approvalNote = text || null;
    c.approvalReviewedAt = nowIso();
    if (decision === "approve") {
      c.approvalStatus = "approved";
      // Funded campaigns go live immediately; unfunded ones wait for the brand to fund.
      if (c.fundedAt && (c.status === "verifying" || c.status === "draft")) {
        c.status = "live";
        recomputeEligibility(db, c);
      }
    } else if (decision === "reject") {
      c.approvalStatus = "rejected";
      if (!["closed", "cancelled"].includes(c.status)) c.status = "cancelled";
    } else {
      c.approvalStatus = "changes_requested";
      if (c.status === "live") c.status = "verifying";
    }
    logAdmin(db, {
      adminId: session.userId,
      action: decision === "approve" ? "campaign_approve" : decision === "reject" ? "campaign_reject" : "campaign_send_back",
      targetType: "campaign",
      targetId: c.id,
      reason: text,
      details: `${c.title}: approval ${beforeApproval} → ${c.approvalStatus}; status ${beforeStatus} → ${c.status}${
        decision === "reject" && c.fundedAt ? "; funded campaign, refund must be handled manually" : ""
      }`,
    });
    return { ok: true };
  });
}

const STATUS_ACTIONS = {
  pause: { from: ["live"], to: "paused" },
  resume: { from: ["paused"], to: "live" },
  close_applications: { from: ["live", "paused"], to: "applications_closed" },
  reopen_applications: { from: ["applications_closed"], to: "live" },
  cancel: {
    from: ["draft", "verifying", "live", "paused", "applications_closed", "shortlisted"],
    to: "cancelled",
  },
} as const satisfies Record<string, { from: readonly CampaignStatus[]; to: CampaignStatus }>;

export type CampaignStatusAction = keyof typeof STATUS_ACTIONS;

export async function setCampaignStatus(
  campaignId: string,
  action: CampaignStatusAction,
  note: string,
): Promise<Result> {
  const session = await requireUser(["admin"]);
  const rule = STATUS_ACTIONS[action];
  if (!rule) return { ok: false, error: "Unknown action." };
  return updateDb((db): Result => {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return { ok: false, error: "Campaign not found." };
    if (!(rule.from as readonly string[]).includes(c.status)) {
      return { ok: false, error: `Can't ${action.replace(/_/g, " ")} a campaign that is ${c.status.replace(/_/g, " ")}.` };
    }
    if (rule.to === "live" && campaignApproval(c) !== "approved") {
      return { ok: false, error: "Approve the campaign before putting it live." };
    }
    const before = c.status;
    c.status = rule.to;
    if (rule.to === "live" && !c.fundedAt) {
      c.status = before;
      return { ok: false, error: "This campaign is not funded yet." };
    }
    logAdmin(db, {
      adminId: session.userId,
      action: "campaign_status",
      targetType: "campaign",
      targetId: c.id,
      reason: clean(note),
      details: `${c.title}: ${before} → ${c.status}`,
    });
    return { ok: true };
  });
}

export type CampaignEdit = {
  title: string;
  brief: string;
  dosDonts: string;
  budgetPaise: number;
  basePaise: number;
  ratePer1000Paise: number;
  capPerCreatorPaise: number;
  slots: number;
  applicationClosesAt: string | null;
  awardDeadlineAt: string | null;
  criteria: CampaignCriteria;
};

function validateEdit(e: CampaignEdit): string | null {
  if (!e.title.trim()) return "Title is required.";
  if (!e.brief.trim()) return "Brief is required.";
  if (!Number.isFinite(e.budgetPaise) || e.budgetPaise < MIN_BOUNTY_BUDGET_PAISE) return "Budget must be at least ₹5,000.";
  if (!Number.isInteger(e.slots) || e.slots < 1) return "Need at least one creator slot.";
  for (const [k, v] of [
    ["Base", e.basePaise],
    ["Rate", e.ratePer1000Paise],
    ["Cap", e.capPerCreatorPaise],
  ] as const) {
    if (!Number.isFinite(v) || v < 0) return `${k} must be zero or more.`;
  }
  if (e.capPerCreatorPaise < e.basePaise) return "Cap per creator must be at least the base.";
  for (const d of [e.applicationClosesAt, e.awardDeadlineAt]) {
    if (d && Number.isNaN(new Date(d).getTime())) return "One of the dates is invalid.";
  }
  return null;
}

const EDIT_FIELDS: (keyof CampaignEdit)[] = [
  "title",
  "brief",
  "dosDonts",
  "budgetPaise",
  "basePaise",
  "ratePer1000Paise",
  "capPerCreatorPaise",
  "slots",
  "applicationClosesAt",
  "awardDeadlineAt",
  "criteria",
];

export async function updateCampaign(campaignId: string, edit: CampaignEdit): Promise<Result> {
  const session = await requireUser(["admin"]);
  const err = validateEdit(edit);
  if (err) return { ok: false, error: err };
  return updateDb((db): Result => {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return { ok: false, error: "Campaign not found." };
    const changed: string[] = [];
    const next: CampaignEdit = {
      ...edit,
      title: edit.title.trim(),
      brief: edit.brief.trim(),
      dosDonts: edit.dosDonts.trim(),
    };
    for (const k of EDIT_FIELDS) {
      const a = JSON.stringify(c[k as keyof Campaign] ?? null);
      const b = JSON.stringify(next[k] ?? null);
      if (a !== b) changed.push(k);
    }
    if (changed.length === 0) return { ok: true };
    Object.assign(c, next);
    if (changed.includes("criteria") && ["live", "paused"].includes(c.status)) recomputeEligibility(db, c);
    logAdmin(db, {
      adminId: session.userId,
      action: "campaign_edit",
      targetType: "campaign",
      targetId: c.id,
      details: `${c.title}: changed ${changed.join(", ")}${
        c.fundedAt && changed.includes("budgetPaise") ? " (funded amount in ledger unchanged)" : ""
      }`,
    });
    return { ok: true };
  });
}

/** Create a campaign for a brand. It is pre-approved; the brand still funds it. */
export async function createCampaignForBrand(
  brandId: string,
  edit: CampaignEdit & { presetId?: string | null },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await requireUser(["admin"]);
  const err = validateEdit(edit);
  if (err) return { ok: false, error: err };
  return updateDb((db) => {
    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) return { ok: false as const, error: "Brand not found." };
    const c: Campaign = {
      id: id("cmp"),
      brandId: brand.id,
      slug: `${slugify(edit.title)}-${Date.now().toString(36)}`,
      title: edit.title.trim(),
      brief: edit.brief.trim(),
      dosDonts: edit.dosDonts.trim(),
      ratePer1000Paise: edit.ratePer1000Paise,
      budgetPaise: edit.budgetPaise,
      basePaise: edit.basePaise,
      capPerCreatorPaise: edit.capPerCreatorPaise,
      slots: edit.slots,
      criteria: edit.criteria,
      presetId: edit.presetId ?? null,
      status: "draft",
      approvalStatus: "approved",
      approvalNote: null,
      approvalReviewedAt: nowIso(),
      createdByAdminId: session.userId,
      applicationClosesAt: edit.applicationClosesAt,
      awardDeadlineAt: edit.awardDeadlineAt,
      createdAt: nowIso(),
      fundedAt: null,
    };
    db.campaigns.push(c);
    logAdmin(db, {
      adminId: session.userId,
      action: "campaign_create",
      targetType: "campaign",
      targetId: c.id,
      details: `${c.title} for ${brand.businessName}`,
    });
    return { ok: true as const, id: c.id };
  });
}

/* ---------------------------------------------------------- Applications */

export async function reviewApplications(
  applicationIds: string[],
  approve: boolean,
  note: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const session = await requireUser(["admin"]);
  const ids = Array.from(new Set(applicationIds)).slice(0, 500);
  if (ids.length === 0) return { ok: false, error: "Select at least one application." };
  const text = clean(note);
  const notify: { to: string; title: string; creator: string }[] = [];
  const res = await updateDb((db) => {
    let count = 0;
    for (const appId of ids) {
      const a = db.applications.find((x) => x.id === appId);
      if (!a) continue;
      const before = a.reviewStatus ?? "pending";
      const next = approve ? "approved" : "rejected";
      if (before === next) continue;
      a.reviewStatus = next;
      a.reviewNote = text || null;
      a.reviewedAt = nowIso();
      a.reviewedBy = session.userId;
      count++;
      const c = db.campaigns.find((x) => x.id === a.campaignId);
      const cr = db.creators.find((x) => x.id === a.creatorId);
      logAdmin(db, {
        adminId: session.userId,
        action: approve ? "application_approve" : "application_reject",
        targetType: "application",
        targetId: a.id,
        reason: text,
        details: `${cr?.displayName ?? a.creatorId} → ${c?.title ?? a.campaignId}${ids.length > 1 ? ` (bulk of ${ids.length})` : ""}`,
      });
      if (approve && c) {
        const brand = db.brands.find((b) => b.id === c.brandId);
        const bu = brand ? db.users.find((u) => u.id === brand.userId) : null;
        if (bu?.email) notify.push({ to: bu.email, title: c.title, creator: cr?.displayName ?? "A creator" });
      }
    }
    return { ok: true as const, count };
  });
  for (const n of notify) {
    try {
      await sendApplicationNotice(n.to, n.title, n.creator);
    } catch {
      // Email is best-effort; the approval already landed.
    }
  }
  return res;
}

/* ----------------------------------------------------------------- Users */

export async function setUserActive(userId: string, active: boolean, reason: string): Promise<Result> {
  const session = await requireUser(["admin"]);
  if (userId === session.userId) return { ok: false, error: "You can't turn off your own account." };
  const note = clean(reason);
  if (!active && !note) return { ok: false, error: "Type a reason for turning the account off." };
  return updateDb((db): Result => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return { ok: false, error: "User not found." };
    if (u.role === "admin" && !active) {
      const otherAdmins = db.users.filter((x) => x.role === "admin" && x.id !== u.id && x.status === "active");
      if (otherAdmins.length === 0) return { ok: false, error: "Can't turn off the last active admin." };
    }
    const before = u.status;
    u.status = active ? "active" : "inactive";
    logAdmin(db, {
      adminId: session.userId,
      action: active ? "user_activate" : "user_deactivate",
      targetType: "user",
      targetId: u.id,
      reason: note,
      details: `${u.name} (${u.role}): ${before} → ${u.status}`,
    });
    return { ok: true };
  });
}

/* ------------------------------------------------------- Existing tools */

export async function enterManualViews(applicationId: string, views: number) {
  const session = await requireUser(["admin"]);
  if (!Number.isFinite(views) || views < 0) return { ok: false as const, error: "Enter a valid view count." };
  return updateDb((db) => {
    const app = db.applications.find((a) => a.id === applicationId);
    if (!app) return { ok: false as const, error: "Not found" };
    const campaign = db.campaigns.find((c) => c.id === app.campaignId);
    if (!campaign) return { ok: false as const, error: "Not found" };
    const reel = db.reels.find((r) => r.applicationId === applicationId);
    if (!reel) return { ok: false as const, error: "No reel submitted" };
    reel.finalViews = views;
    reel.hasPaidPartnershipLabel = true;
    app.status = "VERIFIED";

    const performance = performanceEarning(views, campaign.ratePer1000Paise, campaign.capPerCreatorPaise - campaign.basePaise);
    const earning = Math.min(campaign.basePaise + performance, campaign.capPerCreatorPaise);
    const payout = creatorPayout(earning);

    db.ledger.push({
      id: id("led"),
      type: "earning",
      amountPaise: payout.earning,
      campaignId: campaign.id,
      applicationId,
      brandId: campaign.brandId,
      creatorId: app.creatorId,
      createdAt: nowIso(),
      note: `Verified views ${views}`,
    });
    db.ledger.push({
      id: id("led"),
      type: "commission",
      amountPaise: payout.commission,
      campaignId: campaign.id,
      applicationId,
      brandId: null,
      creatorId: app.creatorId,
      createdAt: nowIso(),
      note: "Creator commission 10%",
    });
    logAdmin(db, {
      adminId: session.userId,
      action: "manual_metrics",
      targetType: "application",
      targetId: applicationId,
      reason: `Entered ${views} views from screen recording`,
      details: `${campaign.title}: earning ${payout.earning} paise, commission ${payout.commission} paise`,
    });
    return { ok: true as const, earning: payout };
  });
}

export async function shortlistOverride(applicationId: string, action: "pin" | "remove", reason: string): Promise<Result> {
  const session = await requireUser(["admin"]);
  const note = clean(reason);
  if (!note) return { ok: false, error: "Type a reason." };
  return updateDb((db): Result => {
    const a = db.applications.find((x) => x.id === applicationId);
    if (!a) return { ok: false, error: "Application not found." };
    db.shortlistOverrides.push({
      id: id("so"),
      applicationId,
      action,
      reason: note,
      adminId: session.userId,
      createdAt: nowIso(),
    });
    logAdmin(db, {
      adminId: session.userId,
      action: action === "pin" ? "shortlist_pin" : "shortlist_remove",
      targetType: "application",
      targetId: applicationId,
      reason: note,
    });
    return { ok: true };
  });
}

/** Small read helper for client forms (brand picker). */
export async function listBrandsForPicker() {
  await requireUser(["admin"]);
  const db = await readDb();
  return db.brands.map((b) => ({ id: b.id, name: b.businessName, kyc: b.kycStatus }));
}
