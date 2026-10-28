"use server";

import { requireUser } from "@/server/auth/session";
import { creatorPayout, performanceEarning } from "@/lib/money";
import { id, nowIso, updateDb } from "@/server/db/store";

export async function approveBrandKyc(brandId: string, approve: boolean, reason: string) {
  const session = await requireUser(["admin"]);
  return updateDb((db) => {
    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) return { ok: false as const, error: "Not found" };
    brand.kycStatus = approve ? "approved" : "rejected";
    db.adminActions.push({
      id: id("aa"),
      adminId: session.userId,
      action: approve ? "kyc_approve" : "kyc_reject",
      targetType: "brand",
      targetId: brandId,
      reason,
      createdAt: nowIso(),
    });
    return { ok: true as const };
  });
}

export async function enterManualViews(applicationId: string, views: number) {
  const session = await requireUser(["admin"]);
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
    db.adminActions.push({
      id: id("aa"),
      adminId: session.userId,
      action: "manual_metrics",
      targetType: "application",
      targetId: applicationId,
      reason: `Entered ${views} views from screen recording`,
      createdAt: nowIso(),
    });
    return { ok: true as const, earning: payout };
  });
}

export async function shortlistOverride(applicationId: string, action: "pin" | "remove", reason: string) {
  const session = await requireUser(["admin"]);
  return updateDb((db) => {
    db.shortlistOverrides.push({
      id: id("so"),
      applicationId,
      action,
      reason,
      adminId: session.userId,
      createdAt: nowIso(),
    });
    return { ok: true as const };
  });
}
