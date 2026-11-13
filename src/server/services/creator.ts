"use server";

import { requireUser } from "@/server/auth/session";
import { id, nowIso, updateDb } from "@/server/db/store";
import { instagramConnectState, isProfessional } from "@/server/integrations/instagram";
import { creatorCategoriesOk, isCategory } from "@/lib/categories";
import { panOk, phoneOk, requiredText, upiOk } from "@/lib/validate";

export type CreatorProfileInput = {
  displayName: string;
  handle: string;
  city: string;
  languages: string[];
  categories: string[];
  whatsapp: string;
  /** Empty = keep what is on file. Ignored when skipPan is set. */
  pan: string;
  /** Creator chose "Skip" for PAN; it is asked again before a payout. */
  skipPan?: boolean;
  /** Empty = keep what is on file. */
  upi: string;
  /** Self-reported until Instagram is connected (older non-Instagram accounts only). */
  followers?: number;
};

export type CreatorProfileResult = { ok: true } | { ok: false; error: string; field?: keyof CreatorProfileInput };

/** Save the creator profile (onboarding wizard and the profile page share this). PAN is optional. */
export async function saveCreatorProfile(input: CreatorProfileInput): Promise<CreatorProfileResult> {
  const session = await requireUser(["creator"]);
  const igState = instagramConnectState();
  const displayName = (input.displayName || "").trim().slice(0, 80);
  const city = (input.city || "").trim().slice(0, 80);
  const languages = (input.languages || []).map((l) => l.trim()).filter(Boolean).slice(0, 8);
  const whatsapp = (input.whatsapp || "").trim();
  const pan = input.skipPan ? "" : (input.pan || "").trim().toUpperCase();
  const upi = (input.upi || "").trim();
  if (requiredText(displayName, "Display name")) return { ok: false, field: "displayName", error: requiredText(displayName, "Display name")! };
  if (requiredText(city, "City")) return { ok: false, field: "city", error: requiredText(city, "City")! };
  if (!languages.length) return { ok: false, field: "languages", error: "Add at least one language." };
  if (whatsapp && phoneOk(whatsapp)) return { ok: false, field: "whatsapp", error: phoneOk(whatsapp)! };
  if (pan && panOk(pan)) return { ok: false, field: "pan", error: panOk(pan)! };
  if (upi && upiOk(upi)) return { ok: false, field: "upi", error: upiOk(upi)! };

  return updateDb((db): CreatorProfileResult => {
    const creator = db.creators.find((c) => c.userId === session.userId);
    if (!creator) return { ok: false, error: "Creator profile not found. Log in with Instagram again." };
    // Dropdown values only; older free-text values already on the profile may stay.
    const categories = [...new Set((input.categories || []).map((c) => c.trim()).filter(Boolean))];
    const bad = categories.find((c) => !isCategory(c) && !creator.categories.includes(c));
    if (bad) return { ok: false, field: "categories", error: "Pick categories from the list." };
    const catErr = creatorCategoriesOk(categories);
    if (catErr) return { ok: false, field: "categories", error: catErr };

    const ig = creator.instagram;
    const existing = db.creatorMetrics.find((m) => m.creatorId === creator.id);
    creator.displayName = displayName;
    // Instagram-linked creators keep the handle Instagram gave us.
    if (!ig && input.handle) creator.handle = input.handle.replace(/^@/, "").trim().toLowerCase();
    creator.city = city;
    creator.languages = languages;
    creator.categories = categories;
    if (pan) {
      creator.panMasked = `****${pan.slice(-4)}`;
      creator.panSkippedAt = null;
    } else if (input.skipPan && !creator.panMasked) {
      creator.panSkippedAt = nowIso();
    }
    if (upi) creator.upiMasked = `****${upi.slice(-4)}`;
    if (!creator.onboardedAt) creator.onboardedAt = nowIso();

    const fromIg = Boolean(ig);
    const metrics = {
      creatorId: creator.id,
      followers: fromIg ? (ig?.followers ?? existing?.followers ?? 0) : (input.followers ?? existing?.followers ?? 0),
      accountType: fromIg ? (ig?.accountType ?? null) : ((igState.ready ? existing?.accountType : "CREATOR") as "CREATOR"),
      accountAgeDays: existing?.accountAgeDays ?? 180,
      mediaCount: fromIg ? (ig?.mediaCount ?? existing?.mediaCount ?? 0) : (existing?.mediaCount ?? 24),
      avgReelViews10: existing?.avgReelViews10 ?? (fromIg ? null : Math.round((input.followers ?? 12000) * 0.4)),
      engagementRate10: existing?.engagementRate10 ?? (fromIg ? null : 0.035),
      audienceCountryPct: (fromIg ? (ig?.audience?.countryPct ?? existing?.audienceCountryPct ?? null) : (existing?.audienceCountryPct ?? { IN: 78 })),
      audienceCityPct: (fromIg ? (ig?.audience?.cityPct ?? existing?.audienceCityPct ?? null) : (existing?.audienceCityPct ?? { [city || "Delhi"]: 22 })),
      audienceGenderAge: (fromIg ? (ig?.audience?.genderPct ?? existing?.audienceGenderAge ?? null) : (existing?.audienceGenderAge ?? { female: 58, male: 42 })),
      niches: categories,
      nicheVerified: existing?.nicheVerified ?? [],
      languages,
      city,
      whatsapp: whatsapp || existing?.whatsapp || null,
      pan: pan || (input.skipPan ? null : (existing?.pan ?? null)),
      upi: upi || existing?.upi || null,
      redcupScore: existing?.redcupScore ?? null,
      onTimeRate: existing?.onTimeRate ?? null,
      firstDraftRate: existing?.firstDraftRate ?? null,
      qualityRating: existing?.qualityRating ?? null,
      fraudFlagsUpheld: existing?.fraudFlagsUpheld ?? 0,
      competitorHistory: existing?.competitorHistory ?? [],
      igConnected: fromIg ? isProfessional(ig?.accountType ?? null) : igState.ready ? Boolean(existing?.igConnected) : true,
      tokenValid: fromIg ? Boolean(ig?.tokenValid) : igState.ready ? Boolean(existing?.tokenValid) : true,
      refreshedAt: nowIso(),
    };
    if (existing) Object.assign(existing, metrics);
    else db.creatorMetrics.push(metrics);

    if (metrics.igConnected && metrics.whatsapp && metrics.pan && metrics.upi && metrics.mediaCount >= 10) {
      creator.level = "verified";
    }
    return { ok: true };
  });
}

/** @deprecated use saveCreatorProfile; kept for older callers. */
export async function saveCreatorOnboarding(input: CreatorProfileInput) {
  const res = await saveCreatorProfile(input);
  if (!res.ok) throw new Error(res.error);
  return { ok: true as const, instagram: instagramConnectState() };
}

export async function uploadDraft(applicationId: string, caption: string, videoPath: string) {
  const session = await requireUser(["creator"]);
  return updateDb((db) => {
    const creator = db.creators.find((c) => c.userId === session.userId);
    const app = db.applications.find((a) => a.id === applicationId);
    if (!creator || !app || app.creatorId !== creator.id) return { ok: false as const, error: "Not found" };
    if (app.status !== "AWARDED" && app.status !== "REVISION") {
      return { ok: false as const, error: "Not awaiting a draft." };
    }
    const version = app.status === "REVISION" ? 2 : 1;
    db.drafts.push({
      id: id("dr"),
      applicationId,
      videoPath,
      caption,
      version: version as 1 | 2,
      reviewStatus: "pending",
      reviewReason: null,
      createdAt: nowIso(),
    });
    app.status = "DRAFT_SENT";
    return { ok: true as const };
  });
}

export async function submitReelLink(applicationId: string, permalink: string) {
  const session = await requireUser(["creator"]);
  return updateDb((db) => {
    const creator = db.creators.find((c) => c.userId === session.userId);
    const app = db.applications.find((a) => a.id === applicationId);
    if (!creator || !app || app.creatorId !== creator.id) return { ok: false as const, error: "Not found" };
    if (app.status !== "APPROVED") return { ok: false as const, error: "Draft must be approved first." };
    db.reels.push({
      id: id("rl"),
      applicationId,
      permalink,
      postedAt: nowIso(),
      hasPaidPartnershipLabel: null,
      finalViews: null,
    });
    app.status = "POSTED";
    return { ok: true as const };
  });
}
