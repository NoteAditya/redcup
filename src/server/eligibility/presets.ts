import type { CampaignCriteria } from "@/lib/types";

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
