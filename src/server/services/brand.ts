"use server";

import { requireUser } from "@/server/auth/session";
import { nowIso, updateDb } from "@/server/db/store";

export async function saveBrandOnboarding(input: {
  businessName: string;
  category: string;
  city: string;
  website?: string;
  gstin?: string;
}) {
  const session = await requireUser(["brand"]);
  await updateDb((db) => {
    const brand = db.brands.find((b) => b.userId === session.userId);
    if (!brand) throw new Error("NO_BRAND");
    brand.businessName = input.businessName.trim();
    brand.category = input.category.trim();
    brand.city = input.city.trim();
    brand.website = input.website?.trim() || null;
    if (input.gstin?.trim()) {
      brand.gstin = input.gstin.trim().toUpperCase();
      brand.kycStatus = "submitted";
    }
  });
  return { ok: true as const };
}

export async function reviewDraft(draftId: string, decision: "approved" | "revision" | "rejected", reason?: string) {
  const session = await requireUser(["brand"]);
  return updateDb((db) => {
    const draft = db.drafts.find((d) => d.id === draftId);
    if (!draft) return { ok: false as const, error: "Not found" };
    const app = db.applications.find((a) => a.id === draft.applicationId);
    if (!app) return { ok: false as const, error: "Not found" };
    const campaign = db.campaigns.find((c) => c.id === app.campaignId);
    const brand = db.brands.find((b) => b.userId === session.userId);
    if (!campaign || !brand || campaign.brandId !== brand.id) return { ok: false as const, error: "Forbidden" };

    draft.reviewStatus = decision;
    draft.reviewReason = reason || null;
    if (decision === "approved") app.status = "APPROVED";
    else if (decision === "revision") {
      if (draft.version >= 2) {
        app.status = "REJECTED";
        draft.reviewStatus = "rejected";
      } else app.status = "REVISION";
    } else app.status = "REJECTED";
    return { ok: true as const };
  });
}
