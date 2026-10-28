import { describe, expect, it } from "vitest";
import { evaluate } from "@/server/eligibility/evaluate";
import { fitScore } from "@/server/eligibility/fit-score";
import type { CampaignCriteria, CreatorMetrics } from "@/lib/types";

function base(over: Partial<CreatorMetrics> = {}): CreatorMetrics {
  return {
    creatorId: "c1",
    followers: 25000,
    accountType: "CREATOR",
    accountAgeDays: 200,
    mediaCount: 40,
    avgReelViews10: 12000,
    engagementRate10: 0.04,
    audienceCountryPct: { IN: 72 },
    audienceCityPct: { Delhi: 15, Mumbai: 10 },
    audienceGenderAge: { female: 60, male: 40 },
    niches: ["beauty", "skincare"],
    nicheVerified: ["beauty"],
    languages: ["hi", "en"],
    city: "Delhi",
    whatsapp: "+919999999999",
    pan: "ABCDE1234F",
    upi: "creator@upi",
    redcupScore: null,
    onTimeRate: null,
    firstDraftRate: null,
    qualityRating: null,
    fraudFlagsUpheld: 0,
    competitorHistory: [],
    igConnected: true,
    tokenValid: true,
    refreshedAt: new Date().toISOString(),
    ...over,
  };
}

const beautyMicro: CampaignCriteria = {
  followers: { mode: "must", min: 10000, max: 50000 },
  niches: { mode: "must", any_of: ["beauty", "skincare"] },
};

describe("eligibility evaluate (spec cases 1–9)", () => {
  it("1: 8K beauty → NOT_ELIGIBLE (gap > 10%)", () => {
    const r = evaluate(base({ followers: 8000 }), beautyMicro);
    expect(r.status).toBe("NOT_ELIGIBLE");
  });

  it("2: 9.2K beauty → ALMOST", () => {
    const r = evaluate(base({ followers: 9200 }), beautyMicro);
    expect(r.status).toBe("ALMOST");
    expect(r.reasons[0].message.toLowerCase()).toContain("800");
  });

  it("3: 25K food → NOT_ELIGIBLE niche", () => {
    const r = evaluate(base({ niches: ["food"] }), beautyMicro);
    expect(r.status).toBe("NOT_ELIGIBLE");
    expect(r.reasons.some((x) => x.code === "NICHE_MISMATCH")).toBe(true);
  });

  it("4: IG not connected → NOT_VERIFIED", () => {
    const r = evaluate(base({ igConnected: false, tokenValid: false }), beautyMicro);
    expect(r.status).toBe("NOT_VERIFIED");
  });

  it("5: no audience data + must country → NOT_ELIGIBLE data unavailable", () => {
    const criteria: CampaignCriteria = {
      ...beautyMicro,
      audience_country: { mode: "must", country: "IN", min_pct: 60 },
    };
    const r = evaluate(base({ followers: 3000, audienceCountryPct: null }), criteria);
    expect(r.status).toBe("NOT_ELIGIBLE");
    expect(r.reasons.some((x) => x.code === "DATA_UNAVAILABLE")).toBe(true);
  });

  it("6: competitor lock 12 days ago → NOT_ELIGIBLE", () => {
    const criteria: CampaignCriteria = {
      ...beautyMicro,
      competitor_lock: { mode: "must", brand_ids: ["b_comp"], days: 30 },
    };
    const awardedAt = new Date(Date.now() - 12 * 86400000).toISOString();
    const r = evaluate(
      base({ competitorHistory: [{ brandId: "b_comp", awardedAt }] }),
      criteria,
    );
    expect(r.status).toBe("NOT_ELIGIBLE");
    expect(r.reasons.some((x) => x.code === "COMPETITOR_LOCK")).toBe(true);
  });

  it("7: snapshot lock is application concern — eligible stays eligible at apply time", () => {
    const r = evaluate(base({ followers: 12000 }), beautyMicro);
    expect(r.status).toBe("ELIGIBLE");
  });

  it("8: two failed numeric within 10% → NOT_ELIGIBLE (ALMOST needs exactly one)", () => {
    const criteria: CampaignCriteria = {
      followers: { mode: "must", min: 10000, max: 50000 },
      engagement_rate: { mode: "must", min: 0.05 },
      niches: { mode: "must", any_of: ["beauty"] },
    };
    // 9200 is within 10% of 10k; engagement 0.046 is within 10% of 0.05
    const r = evaluate(base({ followers: 9200, engagementRate10: 0.046 }), criteria);
    expect(r.status).toBe("NOT_ELIGIBLE");
  });

  it("9: fit score ranks applicants for auto-award", () => {
    const a = base({ creatorId: "a", avgReelViews10: 20000, qualityRating: 5 });
    const b = base({ creatorId: "b", avgReelViews10: 5000, qualityRating: 2 });
    const sa = fitScore(a, beautyMicro, [a, b]);
    const sb = fitScore(b, beautyMicro, [a, b]);
    expect(sa.score).toBeGreaterThan(sb.score);
  });
});
