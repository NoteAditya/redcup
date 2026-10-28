import type { CampaignCriteria, CreatorMetrics, FitBreakdown } from "@/lib/types";

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
    } else if (key === "audience_cities" && rule && "any_of" in rule && "min_pct" in rule && creator.audienceCityPct) {
      const cityRule = rule as { any_of: string[]; min_pct: number };
      const sum = cityRule.any_of.reduce((a, c) => a + (creator.audienceCityPct![c] ?? 0), 0);
      if (sum >= cityRule.min_pct) met++;
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
