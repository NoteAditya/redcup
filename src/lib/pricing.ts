/** Launch pricing — keep in config, not scattered in UI. Amounts in paise. */
export const PLATFORM_FEE_RATE = 0.15;
export const GST_RATE = 0.18;
export const CREATOR_COMMISSION_RATE = 0.1;
export const TDS_RATE = 0.1; // 10% on creator payout when applicable
export const MIN_BOUNTY_BUDGET_PAISE = 500_000; // ₹5,000
export const SHORTLIST_MULTIPLIER = 3;
export const AWARD_DEADLINE_HOURS = 48;
export const ALMOST_TOLERANCE = 0.1;
export const RING1 = {
  minAccountAgeDays: 90,
  minPosts: 10,
} as const;

export const BASE_BY_TIER = {
  nano: { min: 50_000, max: 150_000 }, // ₹500–1,500
  micro: { min: 150_000, max: 500_000 },
  mid: { min: 500_000, max: 1_500_000 },
} as const;

export function tierFromFollowers(followers: number): keyof typeof BASE_BY_TIER | "open" {
  if (followers >= 50_000) return "mid";
  if (followers >= 10_000) return "micro";
  if (followers >= 1_000) return "nano";
  return "open";
}
