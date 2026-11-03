"use server";

import { slugify } from "@/lib/format";
import { MIN_BOUNTY_BUDGET_PAISE, SHORTLIST_MULTIPLIER, AWARD_DEADLINE_HOURS } from "@/lib/pricing";
import type { CampaignCriteria } from "@/lib/types";
import { requireUser } from "@/server/auth/session";
import { countEligible, evaluate } from "@/server/eligibility/evaluate";
import { fitScore } from "@/server/eligibility/fit-score";
import { CRITERIA_PRESETS } from "@/server/eligibility/presets";
import { createFundingOrder, paymentConnectState } from "@/server/integrations/payments";
import { id, nowIso, readDb, updateDb, type Campaign } from "@/server/db/store";
import { sendApplicationNotice, sendAwardNotice } from "@/server/integrations/mail";

export async function getPresets() {
  return CRITERIA_PRESETS;
}

export async function previewEligibleCount(criteria: CampaignCriteria) {
  const db = await readDb();
  return countEligible(db.creatorMetrics, criteria);
}

export async function createCampaignDraft(input: {
  title: string;
  brief: string;
  dosDonts: string;
  ratePer1000Paise: number;
  budgetPaise: number;
  basePaise: number;
  capPerCreatorPaise: number;
  slots: number;
  criteria: CampaignCriteria;
  presetId?: string;
  applicationDays?: number;
}) {
  const session = await requireUser(["brand"]);
  if (input.budgetPaise < MIN_BOUNTY_BUDGET_PAISE) {
    return { ok: false as const, error: "Budget must be at least ₹5,000." };
  }
  if (input.slots < 1) return { ok: false as const, error: "Need at least one creator slot." };

  const campaign = await updateDb((db) => {
    const brand = db.brands.find((b) => b.userId === session.userId);
    if (!brand) throw new Error("NO_BRAND");
    const c: Campaign = {
      id: id("cmp"),
      brandId: brand.id,
      slug: `${slugify(input.title)}-${Date.now().toString(36)}`,
      title: input.title.trim(),
      brief: input.brief.trim(),
      dosDonts: input.dosDonts.trim(),
      ratePer1000Paise: input.ratePer1000Paise,
      budgetPaise: input.budgetPaise,
      basePaise: input.basePaise,
      capPerCreatorPaise: input.capPerCreatorPaise,
      slots: input.slots,
      criteria: input.criteria,
      presetId: input.presetId ?? null,
      status: "draft",
      applicationClosesAt: new Date(
        Date.now() + (input.applicationDays ?? 7) * 86400000,
      ).toISOString(),
      awardDeadlineAt: null,
      createdAt: nowIso(),
      fundedAt: null,
    };
    db.campaigns.push(c);
    return c;
  });

  return { ok: true as const, campaign };
}

export async function fundCampaign(campaignId: string) {
  const session = await requireUser(["brand"]);
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId);
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!brand || !campaign || campaign.brandId !== brand.id) {
    return { ok: false as const, error: "Campaign not found." };
  }
  if (brand.kycStatus !== "approved") {
    return {
      ok: false as const,
      error: "An admin must approve your KYC before the first bounty goes live.",
    };
  }
  if (campaign.status !== "draft" && campaign.status !== "verifying") {
    return { ok: false as const, error: "This campaign is already funded or closed." };
  }

  const order = await createFundingOrder({
    campaignId: campaign.id,
    brandId: brand.id,
    budgetPaise: campaign.budgetPaise,
  });

  await updateDb((db2) => {
    db2.paymentOrders.push({
      id: id("pay"),
      campaignId: campaign.id,
      brandId: brand.id,
      budgetPaise: order.checkout.budget,
      feePaise: order.checkout.fee,
      gstPaise: order.checkout.gst,
      prizePaise: order.checkout.prize,
      totalPaise: order.checkout.total,
      provider: order.provider,
      providerOrderId: order.orderId,
      status: order.demo ? "paid" : "created",
      createdAt: nowIso(),
    });

    if (order.demo) {
      const c = db2.campaigns.find((x) => x.id === campaign.id)!;
      c.status = "live";
      c.fundedAt = nowIso();
      db2.ledger.push(
        {
          id: id("led"),
          type: "funding",
          amountPaise: order.checkout.budget,
          campaignId: c.id,
          applicationId: null,
          brandId: brand.id,
          creatorId: null,
          createdAt: nowIso(),
          note: "TEST MODE funding — Razorpay test order or demo; no live charge",
        },
        {
          id: id("led"),
          type: "fee",
          amountPaise: order.checkout.fee,
          campaignId: c.id,
          applicationId: null,
          brandId: brand.id,
          creatorId: null,
          createdAt: nowIso(),
          note: "Platform fee",
        },
        {
          id: id("led"),
          type: "gst",
          amountPaise: order.checkout.gst,
          campaignId: c.id,
          applicationId: null,
          brandId: brand.id,
          creatorId: null,
          createdAt: nowIso(),
          note: "GST on fee",
        },
      );

      // Recompute eligibility for all creators
      for (const m of db2.creatorMetrics) {
        const result = evaluate(m, c.criteria);
        db2.eligibility = db2.eligibility.filter(
          (e) => !(e.campaignId === c.id && e.creatorId === m.creatorId),
        );
        db2.eligibility.push({
          campaignId: c.id,
          creatorId: m.creatorId,
          status: result.status,
          reasons: result.reasons,
          computedAt: nowIso(),
        });
      }
    }
  });

  return {
    ok: true as const,
    demo: order.demo,
    payment: paymentConnectState(),
    checkout: order.checkout,
    orderId: order.orderId,
  };
}

export async function applyToCampaign(campaignId: string) {
  const session = await requireUser(["creator"]);
  const bag: { notify: { brandEmail: string; campTitle: string; creatorName: string } | null } = { notify: null };
  const result = await updateDb((db) => {
    const creator = db.creators.find((c) => c.userId === session.userId);
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    if (!creator || !campaign || campaign.status !== "live") {
      return { ok: false as const, error: "Campaign is not open." };
    }
    const metrics = db.creatorMetrics.find((m) => m.creatorId === creator.id);
    if (!metrics) return { ok: false as const, error: "Finish onboarding and connect Instagram first." };

    const elig = evaluate(metrics, campaign.criteria);
    if (elig.status !== "ELIGIBLE" && elig.status !== "ALMOST") {
      return { ok: false as const, error: elig.reasons.map((r) => r.message).join(" · "), eligibility: elig };
    }
    // ALMOST can see the card but must become ELIGIBLE to apply
    if (elig.status !== "ELIGIBLE") {
      return { ok: false as const, error: elig.reasons[0]?.message || "Not eligible yet.", eligibility: elig };
    }

    if (db.applications.some((a) => a.campaignId === campaignId && a.creatorId === creator.id)) {
      return { ok: false as const, error: "You already applied." };
    }

    db.applications.push({
      id: id("app"),
      campaignId,
      creatorId: creator.id,
      status: "APPLIED",
      appliedAt: nowIso(),
      criteriaSnapshot: campaign.criteria,
      metricsSnapshot: { ...metrics },
      fitScore: null,
      fitBreakdown: null,
      awardDeadlineAt: null,
    });
    const brand = db.brands.find((b) => b.id === campaign.brandId);
    const brandUser = brand ? db.users.find((u) => u.id === brand.userId) : null;
    if (brandUser?.email) {
      bag.notify = { brandEmail: brandUser.email, campTitle: campaign.title, creatorName: creator.displayName };
    }
    return { ok: true as const };
  });
  if (result.ok && bag.notify) {
    await sendApplicationNotice(bag.notify.brandEmail, bag.notify.campTitle, bag.notify.creatorName);
  }
  return result;
}

export async function generateShortlist(campaignId: string) {
  const session = await requireUser(["brand", "admin"]);
  return updateDb((db) => {
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return { ok: false as const, error: "Not found" };
    if (session.role === "brand") {
      const brand = db.brands.find((b) => b.userId === session.userId);
      if (!brand || brand.id !== campaign.brandId) return { ok: false as const, error: "Forbidden" };
    }

    const apps = db.applications.filter(
      (a) => a.campaignId === campaignId && (a.status === "APPLIED" || a.status === "SHORTLISTED"),
    );
    const metricsPool = apps.map((a) => a.metricsSnapshot);
    const scored = apps.map((a) => {
      const { score, breakdown } = fitScore(a.metricsSnapshot, campaign.criteria, metricsPool);
      return { app: a, score, breakdown };
    });
    scored.sort((a, b) => b.score - a.score || a.app.appliedAt.localeCompare(b.app.appliedAt));

    const overrides = db.shortlistOverrides.filter((o) =>
      apps.some((a) => a.id === o.applicationId),
    );
    const removed = new Set(overrides.filter((o) => o.action === "remove").map((o) => o.applicationId));
    const pinned = overrides.filter((o) => o.action === "pin").map((o) => o.applicationId);

    const limit = Math.min(apps.length, campaign.slots * SHORTLIST_MULTIPLIER);
    const shortlistIds = new Set<string>();
    for (const pid of pinned) shortlistIds.add(pid);
    for (const s of scored) {
      if (shortlistIds.size >= limit) break;
      if (removed.has(s.app.id)) continue;
      shortlistIds.add(s.app.id);
    }

    const deadline = new Date(Date.now() + AWARD_DEADLINE_HOURS * 3600_000).toISOString();
    for (const s of scored) {
      s.app.fitScore = s.score;
      s.app.fitBreakdown = s.breakdown;
      if (shortlistIds.has(s.app.id)) {
        s.app.status = "SHORTLISTED";
        s.app.awardDeadlineAt = deadline;
      } else if (s.app.status === "APPLIED") {
        s.app.status = "NOT_SHORTLISTED";
      }
    }
    campaign.status = "shortlisted";
    campaign.awardDeadlineAt = deadline;
    return { ok: true as const, shortlisted: shortlistIds.size, deadline };
  });
}

export async function awardCreators(campaignId: string, applicationIds: string[]) {
  const session = await requireUser(["brand", "admin"]);
  const result = await updateDb((db) => {
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return { ok: false as const, error: "Not found" };
    if (session.role === "brand") {
      const brand = db.brands.find((b) => b.userId === session.userId);
      if (!brand || brand.id !== campaign.brandId) return { ok: false as const, error: "Forbidden" };
    }
    if (applicationIds.length > campaign.slots) {
      return { ok: false as const, error: `You can award at most ${campaign.slots} creators.` };
    }

    const shortlisted = db.applications.filter(
      (a) => a.campaignId === campaignId && a.status === "SHORTLISTED",
    );
    const pick = new Set(applicationIds);
    for (const a of shortlisted) {
      if (pick.has(a.id)) {
        a.status = "AWARDED";
        db.ledger.push({
          id: id("led"),
          type: "reservation",
          amountPaise: campaign.capPerCreatorPaise,
          campaignId,
          applicationId: a.id,
          brandId: campaign.brandId,
          creatorId: a.creatorId,
          createdAt: nowIso(),
          note: "Cap reserved on award",
        });
      } else {
        a.status = "WAITLISTED";
      }
    }
    campaign.status = "in_production";
    return { ok: true as const };
  });

  if (result && result.ok) {
    const db = await (await import("@/server/db/store")).readDb();
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    for (const appId of applicationIds) {
      const app = db.applications.find((a) => a.id === appId);
      if (!app) continue;
      const creator = db.creators.find((c) => c.id === app.creatorId);
      const user = creator ? db.users.find((u) => u.id === creator.userId) : null;
      if (user?.email && campaign) {
        await sendAwardNotice(user.email, campaign.title);
      }
    }
  }
  return result;
}


export async function autoAwardIfDue(campaignId: string) {
  return updateDb((db) => {
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    if (!campaign || !campaign.awardDeadlineAt) return { ok: false as const };
    if (new Date(campaign.awardDeadlineAt).getTime() > Date.now()) return { ok: false as const };
    if (campaign.status !== "shortlisted") return { ok: false as const };
    const shortlisted = db.applications
      .filter((a) => a.campaignId === campaignId && a.status === "SHORTLISTED")
      .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));
    const winners = shortlisted.slice(0, campaign.slots);
    const winIds = new Set(winners.map((w) => w.id));
    for (const a of shortlisted) {
      if (winIds.has(a.id)) {
        a.status = "AWARDED";
        db.ledger.push({
          id: id("led"),
          type: "reservation",
          amountPaise: campaign.capPerCreatorPaise,
          campaignId,
          applicationId: a.id,
          brandId: campaign.brandId,
          creatorId: a.creatorId,
          createdAt: nowIso(),
          note: "Auto-award reservation",
        });
      } else {
        a.status = "NOT_SELECTED";
      }
    }
    campaign.status = "in_production";
    return { ok: true as const, awarded: winners.length };
  });
}
