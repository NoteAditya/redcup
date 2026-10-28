import fs from 'fs';
import path from 'path';
const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

w('src/server/eligibility/ring1.ts', `import { RING1 } from "@/lib/pricing";
import type { CreatorMetrics, EligibilityReason } from "@/lib/types";

export function ring1Failures(m: CreatorMetrics): EligibilityReason[] {
  const fails: EligibilityReason[] = [];

  if (!m.igConnected || !m.tokenValid || !m.accountType || m.accountType === "PERSONAL") {
    fails.push({
      code: "IG_NOT_CONNECTED",
      message: "Connect your Instagram professional account",
    });
  }

  if (m.accountAgeDays == null || m.accountAgeDays < RING1.minAccountAgeDays) {
    const n = m.accountAgeDays ?? 0;
    fails.push({
      code: "ACCOUNT_TOO_NEW",
      message: \`Your account needs to be \${RING1.minAccountAgeDays} days old (yours: \${n} days)\`,
      numeric: true,
      threshold: RING1.minAccountAgeDays,
      value: n,
    });
  }

  if (m.mediaCount < RING1.minPosts) {
    fails.push({
      code: "TOO_FEW_POSTS",
      message: \`You need at least \${RING1.minPosts} posts (you have \${m.mediaCount})\`,
      numeric: true,
      threshold: RING1.minPosts,
      value: m.mediaCount,
    });
  }

  const missing: string[] = [];
  if (!m.whatsapp) missing.push("WhatsApp");
  if (!m.pan) missing.push("PAN");
  if (!m.upi) missing.push("UPI");
  if (missing.length) {
    fails.push({
      code: "PROFILE_INCOMPLETE",
      message: \`Add your \${missing.join(", ")} to apply\`,
    });
  }

  if (m.fraudFlagsUpheld > 0) {
    fails.push({
      code: "ACCOUNT_RESTRICTED",
      message: "Your account can't apply right now; contact support",
    });
  }

  return fails;
}
`);

w('src/server/eligibility/evaluate.ts', `import { ALMOST_TOLERANCE } from "@/lib/pricing";
import type {
  CampaignCriteria,
  CreatorMetrics,
  EligibilityReason,
  EligibilityResult,
  NumericRule,
} from "@/lib/types";
import { ring1Failures } from "./ring1";

function gapPct(threshold: number, value: number): number {
  if (threshold === 0) return 1;
  return Math.abs(threshold - value) / threshold;
}

function checkNumeric(
  rule: NumericRule,
  value: number,
  label: string,
): EligibilityReason | null {
  if (rule.min != null && value < rule.min) {
    return {
      code: "BELOW_MIN",
      message: \`Needs \${label} ≥ \${rule.min} · you have \${value}\`,
      numeric: true,
      threshold: rule.min,
      value,
      gap_pct: gapPct(rule.min, value),
    };
  }
  if (rule.max != null && value > rule.max) {
    return {
      code: "ABOVE_MAX",
      message: \`Needs \${label} ≤ \${rule.max} · you have \${value}\`,
      numeric: true,
      threshold: rule.max,
      value,
      gap_pct: gapPct(rule.max, value),
    };
  }
  return null;
}

function creatorCanFix(ruleKey: string): boolean {
  return ["languages", "niches", "city"].includes(ruleKey) || ruleKey.startsWith("followers") === false
    ? ["languages", "niches"].includes(ruleKey)
    : false;
}

/** True when missing data is something the creator controls (e.g. IG not connected). */
function missingIsCreatorFixable(m: CreatorMetrics, key: string): boolean {
  if (!m.igConnected) return true;
  if (key === "niches" || key === "languages") return true;
  return false;
}

export function evaluate(creator: CreatorMetrics, criteria: CampaignCriteria): EligibilityResult {
  const r1 = ring1Failures(creator);
  if (r1.length) return { status: "NOT_VERIFIED", reasons: r1 };

  const fails: EligibilityReason[] = [];
  const missing: EligibilityReason[] = [];

  const mustEntries = Object.entries(criteria).filter(
    ([, rule]) => rule && (rule as { mode?: string }).mode === "must",
  ) as [keyof CampaignCriteria, NonNullable<CampaignCriteria[keyof CampaignCriteria]>][];

  for (const [key, rule] of mustEntries) {
    if (key === "followers" && "min" in rule) {
      const fail = checkNumeric(rule as NumericRule, creator.followers, "followers");
      if (fail) {
        const min = (rule as NumericRule).min;
        const max = (rule as NumericRule).max;
        fail.message =
          min != null && max != null
            ? \`Needs \${(min / 1000).toFixed(0)}K–\${(max / 1000).toFixed(0)}K followers · you have \${(creator.followers / 1000).toFixed(1)}K\`
            : fail.message;
        fails.push(fail);
      }
      continue;
    }

    if (key === "niches" && "any_of" in rule) {
      const anyOf = rule.any_of.map((s) => s.toLowerCase());
      const have = creator.niches.map((s) => s.toLowerCase());
      const verified = creator.nicheVerified.map((s) => s.toLowerCase());
      const ok = anyOf.some((n) => have.includes(n) && (!rule.require_verified || verified.includes(n)));
      if (!ok) {
        fails.push({
          code: "NICHE_MISMATCH",
          message: \`Needs a \${rule.any_of.join(" or ")} niche\`,
        });
      }
      continue;
    }

    if (key === "avg_reel_views" && "min" in rule) {
      if (creator.avgReelViews10 == null) {
        (missingIsCreatorFixable(creator, key) ? missing : fails).push({
          code: missingIsCreatorFixable(creator, key) ? "DATA_MISSING" : "DATA_UNAVAILABLE",
          message: missingIsCreatorFixable(creator, key)
            ? "Connect Instagram / add details to check eligibility"
            : "Instagram doesn't share reel view data yet",
        });
      } else {
        const fail = checkNumeric(rule as NumericRule, creator.avgReelViews10, "avg reel views");
        if (fail) fails.push(fail);
      }
      continue;
    }

    if (key === "engagement_rate" && "min" in rule) {
      if (creator.engagementRate10 == null) {
        fails.push({
          code: "DATA_UNAVAILABLE",
          message: "Instagram doesn't share engagement data yet",
        });
      } else {
        const fail = checkNumeric(rule as NumericRule, creator.engagementRate10, "engagement rate");
        if (fail) fails.push(fail);
      }
      continue;
    }

    if (key === "audience_country" && "country" in rule) {
      if (!creator.audienceCountryPct) {
        fails.push({
          code: "DATA_UNAVAILABLE",
          message: "Instagram doesn't share audience data for accounts your size yet",
        });
      } else {
        const pct = creator.audienceCountryPct[rule.country] ?? 0;
        if (pct < rule.min_pct) {
          fails.push({
            code: "AUDIENCE_COUNTRY",
            message: \`Needs \${rule.min_pct}%+ audience in \${rule.country} · yours is \${pct}%\`,
            numeric: true,
            threshold: rule.min_pct,
            value: pct,
            gap_pct: gapPct(rule.min_pct, pct),
          });
        }
      }
      continue;
    }

    if (key === "audience_cities" && "any_of" in rule) {
      if (!creator.audienceCityPct) {
        fails.push({
          code: "DATA_UNAVAILABLE",
          message: "Instagram doesn't share city audience data yet",
        });
      } else {
        const sum = rule.any_of.reduce((a, c) => a + (creator.audienceCityPct![c] ?? 0), 0);
        if (sum < rule.min_pct) {
          fails.push({
            code: "AUDIENCE_CITY",
            message: \`Needs \${rule.min_pct}%+ audience in \${rule.any_of.join(", ")} · yours is \${sum}%\`,
            numeric: true,
            threshold: rule.min_pct,
            value: sum,
            gap_pct: gapPct(rule.min_pct, sum),
          });
        }
      }
      continue;
    }

    if (key === "languages" && "any_of" in rule) {
      const ok = rule.any_of.some((l) => creator.languages.map((x) => x.toLowerCase()).includes(l.toLowerCase()));
      if (!ok) {
        fails.push({
          code: "LANGUAGE",
          message: \`Needs language \${rule.any_of.join(" or ")}\`,
        });
      }
      continue;
    }

    if (key === "audience_gender" && "gender" in rule) {
      if (!creator.audienceGenderAge) {
        fails.push({
          code: "DATA_UNAVAILABLE",
          message: "Instagram doesn't share gender audience data yet",
        });
      } else {
        const pct = creator.audienceGenderAge[rule.gender] ?? 0;
        if (pct < rule.min_pct) {
          fails.push({
            code: "AUDIENCE_GENDER",
            message: \`Needs \${rule.min_pct}%+ \${rule.gender} audience · yours is \${pct}%\`,
            numeric: true,
            threshold: rule.min_pct,
            value: pct,
            gap_pct: gapPct(rule.min_pct, pct),
          });
        }
      }
      continue;
    }

    if (key === "competitor_lock" && "brand_ids" in rule) {
      const cutoff = Date.now() - rule.days * 86400000;
      const hit = creator.competitorHistory.find(
        (h) => rule.brand_ids.includes(h.brandId) && new Date(h.awardedAt).getTime() >= cutoff,
      );
      if (hit) {
        fails.push({
          code: "COMPETITOR_LOCK",
          message: \`You promoted a competing brand in the last \${rule.days} days\`,
        });
      }
      continue;
    }

    if (key === "min_redcup_score" && "min" in rule) {
      if (creator.redcupScore == null) {
        // nice-only usually; if must and null, treat as fail soft
        fails.push({
          code: "SCORE_MISSING",
          message: "Needs a RedCup Score — complete a campaign first",
        });
      } else {
        const fail = checkNumeric(rule as NumericRule, creator.redcupScore, "RedCup Score");
        if (fail) fails.push(fail);
      }
    }
  }

  void creatorCanFix;

  if (missing.length) return { status: "INCOMPLETE", reasons: missing };
  if (!fails.length) return { status: "ELIGIBLE", reasons: [] };
  if (fails.length === 1 && fails[0].numeric && (fails[0].gap_pct ?? 1) <= ALMOST_TOLERANCE) {
    const f = fails[0];
    const away = Math.abs((f.threshold ?? 0) - (f.value ?? 0));
    return {
      status: "ALMOST",
      reasons: [
        {
          ...f,
          message:
            f.code === "BELOW_MIN" && f.threshold != null
              ? \`Almost: You're \${away.toLocaleString("en-IN")} followers away\`
              : \`Almost: \${f.message}\`,
        },
      ],
    };
  }
  return { status: "NOT_ELIGIBLE", reasons: fails };
}

/** Count creators matching must rules (for brand builder live count). */
export function countEligible(creators: CreatorMetrics[], criteria: CampaignCriteria): number {
  return creators.filter((c) => evaluate(c, criteria).status === "ELIGIBLE").length;
}
`);

w('src/server/eligibility/fit-score.ts', `import type { CampaignCriteria, CreatorMetrics, FitBreakdown } from "@/lib/types";

function nichePart(creator: CreatorMetrics, criteria: CampaignCriteria): number {
  const rule = criteria.niches;
  if (!rule) return 0.7;
  const anyOf = rule.any_of.map((s) => s.toLowerCase());
  const niches = creator.niches.map((s) => s.toLowerCase());
  const verified = creator.nicheVerified.map((s) => s.toLowerCase());
  let score = 0;
  if (niches[0] && anyOf.includes(niches[0])) score = 1.0;
  else if (niches.some((n) => anyOf.includes(n))) score = 0.7;
  if (verified.some((n) => anyOf.includes(n))) score = Math.min(1, score + 0.1);
  return score;
}

function niceShare(creator: CreatorMetrics, criteria: CampaignCriteria): number {
  const nice = Object.entries(criteria).filter(([, r]) => r && (r as { mode: string }).mode === "nice");
  if (!nice.length) return 1;
  let met = 0;
  for (const [key, rule] of nice) {
    if (key === "avg_reel_views" && rule && "min" in rule && creator.avgReelViews10 != null) {
      if (creator.avgReelViews10 >= (rule.min ?? 0)) met++;
    } else if (key === "engagement_rate" && rule && "min" in rule && creator.engagementRate10 != null) {
      if (creator.engagementRate10 >= (rule.min ?? 0)) met++;
    } else if (key === "audience_cities" && rule && "any_of" in rule && creator.audienceCityPct) {
      const sum = rule.any_of.reduce((a, c) => a + (creator.audienceCityPct![c] ?? 0), 0);
      if (sum >= rule.min_pct) met++;
    } else if (key === "min_redcup_score" && rule && "min" in rule && creator.redcupScore != null) {
      if (creator.redcupScore >= (rule.min ?? 0)) met++;
    } else if (key === "audience_gender" && rule && "gender" in rule && creator.audienceGenderAge) {
      if ((creator.audienceGenderAge[rule.gender] ?? 0) >= rule.min_pct) met++;
    }
  }
  return met / nice.length;
}

/** Fit Score 0–100. Weights in config for later tuning. */
export const FIT_WEIGHTS = { A: 0.4, B: 0.3, C: 0.2, D: 0.1 };

export function fitScore(
  creator: CreatorMetrics,
  criteria: CampaignCriteria,
  applicantPool: CreatorMetrics[],
): { score: number; breakdown: FitBreakdown } {
  const niche = nichePart(creator, criteria);
  const countryPct =
    criteria.audience_country && creator.audienceCountryPct
      ? Math.min(creator.audienceCountryPct[criteria.audience_country.country] ?? 0, 100) / 100
      : 0.7;
  const A = 0.5 * niche + 0.3 * countryPct + 0.2 * niceShare(creator, criteria);

  let B: number;
  if (creator.redcupScore != null) {
    B = creator.redcupScore / 100;
  } else {
    const ratios = applicantPool
      .map((c) => (c.followers > 0 && c.avgReelViews10 != null ? c.avgReelViews10 / c.followers : 0))
      .sort((a, b) => a - b);
    const mine =
      creator.followers > 0 && creator.avgReelViews10 != null
        ? creator.avgReelViews10 / creator.followers
        : 0;
    const rank = ratios.filter((r) => r <= mine).length;
    B = ratios.length ? rank / ratios.length : 0.5;
  }

  const C =
    creator.qualityRating != null ? (creator.qualityRating - 1) / 4 : 0.5;

  const D =
    creator.onTimeRate != null && creator.firstDraftRate != null
      ? 0.6 * creator.onTimeRate + 0.4 * creator.firstDraftRate
      : 0.7;

  const breakdown = { A, B, C, D };
  const score =
    100 *
    (FIT_WEIGHTS.A * A + FIT_WEIGHTS.B * B + FIT_WEIGHTS.C * C + FIT_WEIGHTS.D * D);
  return { score: Math.round(score * 10) / 10, breakdown };
}
`);

w('src/server/eligibility/presets.ts', `import type { CampaignCriteria } from "@/lib/types";

export const CRITERIA_PRESETS: { id: string; name: string; criteria: CampaignCriteria }[] = [
  {
    id: "beauty-micro-pan",
    name: "Beauty · micro · pan-India",
    criteria: {
      followers: { mode: "must", min: 10000, max: 50000 },
      niches: { mode: "must", any_of: ["beauty", "skincare"], require_verified: false },
      audience_country: { mode: "must", country: "IN", min_pct: 60 },
      languages: { mode: "must", any_of: ["hi", "en"] },
      avg_reel_views: { mode: "nice", min: 8000 },
      engagement_rate: { mode: "nice", min: 0.02 },
    },
  },
  {
    id: "food-nano-hindi",
    name: "Food · nano · Hindi",
    criteria: {
      followers: { mode: "must", min: 1000, max: 10000 },
      niches: { mode: "must", any_of: ["food", "beverage"], require_verified: false },
      languages: { mode: "must", any_of: ["hi"] },
      audience_country: { mode: "must", country: "IN", min_pct: 70 },
    },
  },
  {
    id: "fashion-micro-metro",
    name: "Fashion · micro · metro cities",
    criteria: {
      followers: { mode: "must", min: 10000, max: 50000 },
      niches: { mode: "must", any_of: ["fashion", "lifestyle"], require_verified: false },
      audience_cities: { mode: "nice", any_of: ["Delhi", "Mumbai", "Bengaluru"], min_pct: 20 },
      languages: { mode: "must", any_of: ["hi", "en"] },
      audience_country: { mode: "must", country: "IN", min_pct: 60 },
    },
  },
];
`);

w('tests/eligibility.test.ts', `import { describe, expect, it } from "vitest";
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
`);

w('tests/money.test.ts', `import { describe, expect, it } from "vitest";
import { brandCheckoutTotal, creatorPayout, performanceEarning } from "@/lib/money";

describe("money math", () => {
  it("₹50,000 bounty checkout matches Final Model unit economics", () => {
    const c = brandCheckoutTotal(5_000_000);
    expect(c.fee).toBe(750_000);
    expect(c.gst).toBe(135_000);
    expect(c.total).toBe(5_885_000);
  });

  it("performance earning respects cap", () => {
    expect(performanceEarning(64000, 5000, 500_000)).toBe(320_000);
    expect(performanceEarning(1_000_000, 5000, 500_000)).toBe(500_000);
  });

  it("creator payout applies commission and TDS", () => {
    const p = creatorPayout(320_000);
    expect(p.commission).toBe(32_000);
    expect(p.net).toBe(p.earning - p.commission - p.tds);
  });
});
`);

console.log('eligibility done');
