export type Role = "brand" | "creator" | "admin";
export type CreatorLevel = "listed" | "verified" | "proven";
export type BrandKyc = "not_submitted" | "submitted" | "approved" | "rejected";
export type CampaignStatus =
  | "draft"
  | "verifying"
  | "live"
  | "applications_closed"
  | "shortlisted"
  | "awarding"
  | "in_production"
  | "tracking"
  | "ranked"
  | "closed"
  | "cancelled";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "WAITLISTED"
  | "AWARDED"
  | "NOT_SHORTLISTED"
  | "NOT_SELECTED"
  | "DRAFT_SENT"
  | "REVISION"
  | "APPROVED"
  | "POSTED"
  | "TRACKING"
  | "VERIFIED"
  | "PAID"
  | "EXPIRED"
  | "REJECTED"
  | "FLAGGED"
  | "REMOVED";

export type EligibilityStatus =
  | "NOT_VERIFIED"
  | "INCOMPLETE"
  | "NOT_ELIGIBLE"
  | "ALMOST"
  | "ELIGIBLE";

export type RuleMode = "must" | "nice";

export type NumericRule = {
  mode: RuleMode;
  min?: number;
  max?: number;
};

export type CampaignCriteria = {
  followers?: NumericRule;
  niches?: { mode: RuleMode; any_of: string[]; require_verified?: boolean };
  avg_reel_views?: NumericRule;
  engagement_rate?: NumericRule;
  audience_country?: { mode: RuleMode; country: string; min_pct: number };
  audience_cities?: { mode: RuleMode; any_of: string[]; min_pct: number };
  languages?: { mode: RuleMode; any_of: string[] };
  audience_gender?: { mode: RuleMode; gender: "female" | "male"; min_pct: number };
  competitor_lock?: { mode: RuleMode; brand_ids: string[]; days: number };
  min_redcup_score?: NumericRule;
};

export type EligibilityReason = {
  code: string;
  message: string;
  numeric?: boolean;
  threshold?: number;
  value?: number;
  gap_pct?: number;
};

export type EligibilityResult = {
  status: EligibilityStatus;
  reasons: EligibilityReason[];
};

export type CreatorMetrics = {
  creatorId: string;
  followers: number;
  accountType: "CREATOR" | "BUSINESS" | "PERSONAL" | null;
  accountAgeDays: number | null;
  mediaCount: number;
  avgReelViews10: number | null;
  engagementRate10: number | null;
  audienceCountryPct: Record<string, number> | null;
  audienceCityPct: Record<string, number> | null;
  audienceGenderAge: Record<string, number> | null;
  niches: string[];
  nicheVerified: string[];
  languages: string[];
  city: string | null;
  whatsapp: string | null;
  pan: string | null;
  upi: string | null;
  redcupScore: number | null;
  onTimeRate: number | null;
  firstDraftRate: number | null;
  qualityRating: number | null;
  fraudFlagsUpheld: number;
  competitorHistory: { brandId: string; awardedAt: string }[];
  igConnected: boolean;
  tokenValid: boolean;
  refreshedAt: string;
};

export type FitBreakdown = { A: number; B: number; C: number; D: number };
