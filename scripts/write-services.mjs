import fs from 'fs';
import path from 'path';
const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

// Fix auth actions - remove dead code
w('src/server/auth/actions.ts', `"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { id, nowIso, readDb, updateDb } from "@/server/db/store";
import { getSession } from "./session";

function normalizeContact(contact: string) {
  return contact.trim().toLowerCase();
}

export async function demoSignUp(input: {
  role: "brand" | "creator";
  name: string;
  email?: string;
  phone?: string;
  password: string;
}) {
  const contact = input.email || input.phone;
  if (!contact || input.password.length < 6) {
    return { ok: false as const, error: "Email or phone and a password of 6+ characters are required." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userId = id("usr");

  const result = await updateDb((db) => {
    const exists = db.users.find(
      (u) =>
        (input.email && u.email === normalizeContact(input.email)) ||
        (input.phone && u.phone === input.phone.trim()),
    );
    if (exists) return { ok: false as const, error: "An account with that contact already exists." };

    db.users.push({
      id: userId,
      role: input.role,
      email: input.email ? normalizeContact(input.email) : null,
      phone: input.phone?.trim() || null,
      name: input.name.trim(),
      status: "active",
      passwordHash,
      createdAt: nowIso(),
    });

    if (input.role === "brand") {
      const slug =
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "brand";
      db.brands.push({
        id: id("br"),
        userId,
        businessName: input.name.trim(),
        slug: \`\${slug}-\${userId.slice(-4)}\`,
        category: "",
        city: "",
        gstin: null,
        kycStatus: "not_submitted",
        website: null,
        createdAt: nowIso(),
      });
    } else {
      const handle =
        (input.name.replace(/\\s+/g, "").toLowerCase() || "creator") + userId.slice(-4);
      db.creators.push({
        id: id("cr"),
        userId,
        displayName: input.name.trim(),
        handle,
        city: "",
        languages: [],
        categories: [],
        level: "listed",
        panMasked: null,
        upiMasked: null,
        createdAt: nowIso(),
      });
    }
    return { ok: true as const };
  });

  if (!result.ok) return result;

  const session = await getSession();
  session.userId = userId;
  session.role = input.role;
  session.name = input.name.trim();
  session.isLoggedIn = true;
  await session.save();

  redirect(input.role === "brand" ? "/brand/onboarding" : "/creator/onboarding");
}

export async function demoSignIn(input: { contact: string; password: string }) {
  const contact = normalizeContact(input.contact);
  const db = await readDb();
  const user =
    db.users.find(
      (u) =>
        (u.email && u.email === contact) ||
        (u.phone && u.phone === input.contact.trim()),
    ) || null;

  if (!user?.passwordHash) {
    return { ok: false as const, error: "No account found for that contact." };
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return { ok: false as const, error: "Wrong password." };

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  session.isLoggedIn = true;
  await session.save();

  if (user.role === "brand") redirect("/brand");
  if (user.role === "creator") redirect("/creator");
  redirect("/admin");
}

export async function signOut() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

export async function requestOtp(contact: string) {
  if (!process.env.RESEND_API_KEY && !process.env.SMS_API_KEY) {
    return {
      ok: false as const,
      needsConnect: true as const,
      provider: contact.includes("@") ? "Resend (email OTP)" : "MSG91 / Twilio (SMS OTP)",
      message:
        "OTP login needs an email or SMS provider key. Use demo password sign-in for now, or add RESEND_API_KEY / SMS_API_KEY.",
    };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await updateDb((db) => {
    db.otps = db.otps.filter((o) => o.contact !== normalizeContact(contact));
    db.otps.push({
      contact: normalizeContact(contact),
      code,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    });
  });
  return { ok: true as const, demoCode: process.env.NODE_ENV === "production" ? undefined : code };
}
`);

w('src/server/integrations/payments.ts', `import { brandCheckoutTotal } from "@/lib/money";

export type PaymentProviderName = "demo" | "razorpay" | "cashfree";

export function activePaymentProvider(): PaymentProviderName {
  const named = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (named === "razorpay" || named === "cashfree" || named === "demo") return named;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return "razorpay";
  if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) return "cashfree";
  return "demo";
}

export function paymentConnectState(): { ready: boolean; provider: PaymentProviderName; message?: string } {
  const provider = activePaymentProvider();
  if (provider === "demo") {
    return {
      ready: false,
      provider,
      message:
        "Connect Razorpay or Cashfree (set keys in Vercel env). Until then, checkout uses a clear demo capture that never moves real money.",
    };
  }
  return { ready: true, provider };
}

export async function createFundingOrder(input: {
  campaignId: string;
  brandId: string;
  budgetPaise: number;
  prizePaise?: number;
}): Promise<{
  provider: PaymentProviderName;
  orderId: string;
  amountPaise: number;
  checkout: ReturnType<typeof brandCheckoutTotal>;
  demo: boolean;
}> {
  const checkout = brandCheckoutTotal(input.budgetPaise, input.prizePaise ?? 0);
  const provider = activePaymentProvider();
  const orderId = \`ord_\${input.campaignId}_\${Date.now()}\`;

  if (provider === "razorpay") {
    // Real Razorpay Orders API would go here when keys are present.
    return { provider, orderId, amountPaise: checkout.total, checkout, demo: false };
  }
  if (provider === "cashfree") {
    return { provider, orderId, amountPaise: checkout.total, checkout, demo: false };
  }
  return { provider: "demo", orderId, amountPaise: checkout.total, checkout, demo: true };
}
`);

w('src/server/integrations/instagram.ts', `export function instagramConnectState() {
  const ready = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  return {
    ready,
    message: ready
      ? undefined
      : "Connect Meta / Instagram (META_APP_ID + META_APP_SECRET). Until App Review, admins can enter views from screen recordings.",
  };
}

export function instagramAuthUrl(state: string): string | null {
  if (!process.env.META_APP_ID || !process.env.META_REDIRECT_URI) return null;
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: process.env.META_REDIRECT_URI,
    scope: "instagram_business_basic,instagram_business_manage_insights",
    response_type: "code",
    state,
  });
  return \`https://api.instagram.com/oauth/authorize?\${params}\`;
}
`);

w('src/server/integrations/whatsapp.ts', `export function whatsappConnectState() {
  const ready = Boolean(process.env.WHATSAPP_API_KEY);
  return {
    ready,
    message: ready
      ? undefined
      : "Connect a WhatsApp Business provider (WHATSAPP_API_KEY). Alerts are queued but not sent until then.",
  };
}
`);

w('src/server/services/campaigns.ts', `"use server";

import { slugify } from "@/lib/format";
import { MIN_BOUNTY_BUDGET_PAISE, SHORTLIST_MULTIPLIER, AWARD_DEADLINE_HOURS } from "@/lib/pricing";
import type { CampaignCriteria } from "@/lib/types";
import { requireUser } from "@/server/auth/session";
import { countEligible, evaluate } from "@/server/eligibility/evaluate";
import { fitScore } from "@/server/eligibility/fit-score";
import { CRITERIA_PRESETS } from "@/server/eligibility/presets";
import { createFundingOrder, paymentConnectState } from "@/server/integrations/payments";
import { id, nowIso, readDb, updateDb, type Campaign } from "@/server/db/store";

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
      slug: \`\${slugify(input.title)}-\${Date.now().toString(36)}\`,
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
          note: "Demo funding capture",
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
  return updateDb((db) => {
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
    return { ok: true as const };
  });
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
  return updateDb((db) => {
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return { ok: false as const, error: "Not found" };
    if (session.role === "brand") {
      const brand = db.brands.find((b) => b.userId === session.userId);
      if (!brand || brand.id !== campaign.brandId) return { ok: false as const, error: "Forbidden" };
    }
    if (applicationIds.length > campaign.slots) {
      return { ok: false as const, error: \`You can award at most \${campaign.slots} creators.\` };
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
`);

w('src/server/services/creator.ts', `"use server";

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
    creator.panMasked = input.pan ? \`****\${input.pan.slice(-4)}\` : null;
    creator.upiMasked = input.upi ? \`****\${input.upi.slice(-4)}\` : null;

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
`);

w('src/server/services/brand.ts', `"use server";

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
`);

w('src/server/services/admin.ts', `"use server";

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
      note: \`Verified views \${views}\`,
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
      reason: \`Entered \${views} views from screen recording\`,
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
`);

console.log('services done');
