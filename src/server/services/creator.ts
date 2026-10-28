"use server";

import { requireUser } from "@/server/auth/session";
import { id, nowIso, updateDb } from "@/server/db/store";
import { instagramConnectState } from "@/server/integrations/instagram";

export async function saveCreatorOnboarding(input: {
  displayName: string;
  handle: string;
  city: string;
  languages: string[];
  categories: string[];
  whatsapp: string;
  pan: string;
  upi: string;
  /** Demo metrics until Instagram is connected */
  followers?: number;
}) {
  const session = await requireUser(["creator"]);
  const ig = instagramConnectState();

  await updateDb((db) => {
    const creator = db.creators.find((c) => c.userId === session.userId);
    if (!creator) throw new Error("NO_CREATOR");
    creator.displayName = input.displayName.trim();
    creator.handle = input.handle.replace(/^@/, "").trim().toLowerCase();
    creator.city = input.city.trim();
    creator.languages = input.languages;
    creator.categories = input.categories;
    creator.panMasked = input.pan ? `****${input.pan.slice(-4)}` : null;
    creator.upiMasked = input.upi ? `****${input.upi.slice(-4)}` : null;

    const existing = db.creatorMetrics.find((m) => m.creatorId === creator.id);
    const metrics = {
      creatorId: creator.id,
      followers: input.followers ?? existing?.followers ?? 0,
      accountType: (ig.ready ? existing?.accountType : "CREATOR") as "CREATOR",
      accountAgeDays: existing?.accountAgeDays ?? 180,
      mediaCount: existing?.mediaCount ?? 24,
      avgReelViews10: existing?.avgReelViews10 ?? Math.round((input.followers ?? 12000) * 0.4),
      engagementRate10: existing?.engagementRate10 ?? 0.035,
      audienceCountryPct: existing?.audienceCountryPct ?? { IN: 78 },
      audienceCityPct: existing?.audienceCityPct ?? { [input.city || "Delhi"]: 22 },
      audienceGenderAge: existing?.audienceGenderAge ?? { female: 58, male: 42 },
      niches: input.categories,
      nicheVerified: [],
      languages: input.languages,
      city: input.city,
      whatsapp: input.whatsapp,
      pan: input.pan,
      upi: input.upi,
      redcupScore: existing?.redcupScore ?? null,
      onTimeRate: existing?.onTimeRate ?? null,
      firstDraftRate: existing?.firstDraftRate ?? null,
      qualityRating: existing?.qualityRating ?? null,
      fraudFlagsUpheld: 0,
      competitorHistory: existing?.competitorHistory ?? [],
      // Demo connect until Meta keys exist — marked clearly in UI
      igConnected: ig.ready ? Boolean(existing?.igConnected) : true,
      tokenValid: ig.ready ? Boolean(existing?.tokenValid) : true,
      refreshedAt: nowIso(),
    };
    if (existing) Object.assign(existing, metrics);
    else db.creatorMetrics.push(metrics);

    if (metrics.igConnected && metrics.whatsapp && metrics.pan && metrics.upi && metrics.mediaCount >= 10) {
      creator.level = "verified";
    }
  });

  return { ok: true as const, instagram: ig };
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
