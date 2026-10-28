import { ALMOST_TOLERANCE } from "@/lib/pricing";
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
      message: `Needs ${label} ≥ ${rule.min} · you have ${value}`,
      numeric: true,
      threshold: rule.min,
      value,
      gap_pct: gapPct(rule.min, value),
    };
  }
  if (rule.max != null && value > rule.max) {
    return {
      code: "ABOVE_MAX",
      message: `Needs ${label} ≤ ${rule.max} · you have ${value}`,
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
            ? `Needs ${(min / 1000).toFixed(0)}K–${(max / 1000).toFixed(0)}K followers · you have ${(creator.followers / 1000).toFixed(1)}K`
            : fail.message;
        fails.push(fail);
      }
      continue;
    }

    if (key === "niches" && "any_of" in rule) {
      const nicheRule = rule as { mode: "must" | "nice"; any_of: string[]; require_verified?: boolean };
      const anyOf = nicheRule.any_of.map((s) => s.toLowerCase());
      const have = creator.niches.map((s) => s.toLowerCase());
      const verified = creator.nicheVerified.map((s) => s.toLowerCase());
      const ok = anyOf.some((n) => have.includes(n) && (!nicheRule.require_verified || verified.includes(n)));
      if (!ok) {
        fails.push({
          code: "NICHE_MISMATCH",
          message: `Needs a ${rule.any_of.join(" or ")} niche`,
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
            message: `Needs ${rule.min_pct}%+ audience in ${rule.country} · yours is ${pct}%`,
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
      const cityRule = rule as { mode: "must" | "nice"; any_of: string[]; min_pct: number };
      if (!creator.audienceCityPct) {
        fails.push({
          code: "DATA_UNAVAILABLE",
          message: "Instagram doesn't share city audience data yet",
        });
      } else {
        const sum = cityRule.any_of.reduce((a, c) => a + (creator.audienceCityPct![c] ?? 0), 0);
        if (sum < cityRule.min_pct) {
          fails.push({
            code: "AUDIENCE_CITY",
            message: `Needs ${cityRule.min_pct}%+ audience in ${cityRule.any_of.join(", ")} · yours is ${sum}%`,
            numeric: true,
            threshold: cityRule.min_pct,
            value: sum,
            gap_pct: gapPct(cityRule.min_pct, sum),
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
          message: `Needs language ${rule.any_of.join(" or ")}`,
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
            message: `Needs ${rule.min_pct}%+ ${rule.gender} audience · yours is ${pct}%`,
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
          message: `You promoted a competing brand in the last ${rule.days} days`,
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
              ? `Almost: You're ${away.toLocaleString("en-IN")} followers away`
              : `Almost: ${f.message}`,
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
