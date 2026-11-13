"use server";

import { requireUser } from "@/server/auth/session";
import { nowIso, updateDb, type Brand } from "@/server/db/store";
import { isAdminApproved, isBrandApproved, logAdmin } from "@/server/access";
import { isCategory } from "@/lib/categories";
import { brandHasGst } from "@/lib/profile";
import { gstinOptional, requiredText, urlOptional } from "@/lib/validate";

export type BrandProfileInput = {
  businessName: string;
  category: string;
  city: string;
  website?: string;
  /** Empty or missing = skipped for now. A GSTIN that is already on file is never removed here. */
  gstin?: string;
};

export type BrandProfileResult =
  | { ok: true; status: Brand["kycStatus"]; gstMissing: boolean }
  | { ok: false; error: string; field?: keyof BrandProfileInput };

/**
 * Save the brand profile (onboarding wizard and the profile page share this).
 * Approval rule: a brand is only sent to RedCup's Brand approvals queue once it has a GSTIN.
 * Skipping GST finishes onboarding but leaves the account pending ("GST missing").
 */
export async function saveBrandProfile(input: BrandProfileInput): Promise<BrandProfileResult> {
  const session = await requireUser(["brand"]);
  const businessName = (input.businessName || "").trim();
  const category = (input.category || "").trim();
  const city = (input.city || "").trim();
  const website = (input.website || "").trim();
  const gstin = (input.gstin || "").trim().toUpperCase();
  const err =
    (requiredText(businessName, "Business name") && { field: "businessName" as const, error: requiredText(businessName, "Business name")! }) ||
    (requiredText(city, "City") && { field: "city" as const, error: requiredText(city, "City")! }) ||
    (urlOptional(website) && { field: "website" as const, error: urlOptional(website)! }) ||
    (gstinOptional(gstin) && { field: "gstin" as const, error: gstinOptional(gstin)! }) ||
    null;
  if (err) return { ok: false, ...err };

  return updateDb((db): BrandProfileResult => {
    const brand = db.brands.find((b) => b.userId === session.userId);
    if (!brand) return { ok: false, error: "Brand profile not found. Sign in again." };
    // Categories come from the dropdown; an older free-text value may be kept as it is.
    if (!isCategory(category) && category !== brand.category) {
      return { ok: false, field: "category", error: "Pick a category from the list." };
    }
    const at = nowIso();
    brand.businessName = businessName.slice(0, 120);
    brand.category = category;
    brand.city = city.slice(0, 80);
    brand.website = website || null;
    const gstChanged = Boolean(gstin) && gstin !== brand.gstin;
    if (gstChanged) {
      brand.gstin = gstin;
      brand.gstSubmittedAt = at;
    }
    if (!brand.onboardedAt) brand.onboardedAt = at;

    const before = brand.kycStatus;
    if (brand.kycStatus !== "approved") {
      // Pending until a GSTIN is on file; then it goes to the admin Brand approvals queue.
      brand.kycStatus = brandHasGst(brand) ? "submitted" : "not_submitted";
    }
    if (gstChanged || before !== brand.kycStatus) {
      logAdmin(db, {
        adminId: session.userId,
        action: gstChanged ? "brand_gst_submitted" : "brand_profile_saved",
        targetType: "brand",
        targetId: brand.id,
        reason: gstChanged ? "Brand added or changed its GSTIN" : "Brand saved its profile",
        details: `${brand.businessName}: ${before} → ${brand.kycStatus}${brandHasGst(brand) ? "" : " (GST missing)"}`,
      });
    }
    return { ok: true, status: brand.kycStatus, gstMissing: !brandHasGst(brand) };
  });
}

/** @deprecated use saveBrandProfile; kept for older callers. */
export async function saveBrandOnboarding(input: BrandProfileInput) {
  const res = await saveBrandProfile(input);
  if (!res.ok) throw new Error(res.error);
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
    if (!isBrandApproved(brand) || !isAdminApproved(app)) return { ok: false as const, error: "Forbidden" };

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
