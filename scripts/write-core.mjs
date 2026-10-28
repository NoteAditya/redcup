import fs from 'fs';
import path from 'path';

const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

// ---------- package.json scripts ----------
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = 'redcup';
pkg.description = 'RedCup: India pay-for-results Instagram creator campaigns';
pkg.scripts = {
  ...pkg.scripts,
  test: 'vitest run',
  'test:watch': 'vitest',
  'test:e2e': 'playwright test',
  typecheck: 'tsc --noEmit',
  seed: 'node scripts/seed.mjs',
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

// ---------- env example ----------
w('.env.example', `# Copy to .env.local — never commit secrets
# Database (Neon free). Without it the app uses data/store.json on disk.
DATABASE_URL=

# Session
SESSION_SECRET=change-me-to-a-long-random-string-at-least-32-chars

# Encryption for PAN / UPI / Instagram tokens (32+ chars)
ENCRYPTION_KEY=change-me-to-a-long-random-string-at-least-32

# Cron jobs
CRON_SECRET=change-me-cron-secret

# First admin bootstrap email
ADMIN_BOOTSTRAP_EMAIL=thenoteaditya@gmail.com

# Optional: Supabase Auth + Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional: Meta / Instagram
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=

# Optional: Payments (Razorpay or Cashfree)
PAYMENT_PROVIDER=demo
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_WEBHOOK_SECRET=

# Optional: WhatsApp / SMS / Email
WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
SMS_PROVIDER=
SMS_API_KEY=
RESEND_API_KEY=
`);

w('next.config.ts', `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
    ],
  },
};

export default nextConfig;
`);

// ---------- pricing / money ----------
w('src/lib/pricing.ts', `/** Launch pricing — keep in config, not scattered in UI. Amounts in paise. */
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
`);

w('src/lib/money.ts', `import { CREATOR_COMMISSION_RATE, GST_RATE, PLATFORM_FEE_RATE, TDS_RATE } from "./pricing";

/** All money is integer paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatINR(paise: number): string {
  const sign = paise < 0 ? "-" : "";
  const n = Math.abs(paise) / 100;
  return (
    sign +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n)
  );
}

export function platformFee(budgetPaise: number): number {
  return Math.round(budgetPaise * PLATFORM_FEE_RATE);
}

export function gstOnFee(feePaise: number): number {
  return Math.round(feePaise * GST_RATE);
}

export function brandCheckoutTotal(budgetPaise: number, prizePaise = 0): {
  budget: number;
  fee: number;
  gst: number;
  prize: number;
  total: number;
} {
  const fee = platformFee(budgetPaise);
  const gst = gstOnFee(fee);
  return { budget: budgetPaise, fee, gst, prize: prizePaise, total: budgetPaise + fee + gst + prizePaise };
}

/** Performance earning from verified views, capped. */
export function performanceEarning(views: number, ratePer1000Paise: number, capPaise: number): number {
  const raw = Math.floor((views / 1000) * ratePer1000Paise);
  return Math.min(raw, capPaise);
}

export function creatorPayout(earningPaise: number, prizePaise = 0): {
  earning: number;
  commission: number;
  tds: number;
  prize: number;
  net: number;
} {
  const commission = Math.round(earningPaise * CREATOR_COMMISSION_RATE);
  const afterCommission = earningPaise - commission + prizePaise;
  const tds = Math.round(afterCommission * TDS_RATE);
  const net = afterCommission - tds;
  return { earning: earningPaise, commission, tds, prize: prizePaise, net };
}
`);

w('src/lib/format.ts', `export function formatFollowers(n: number): string {
  if (n >= 100_000) return \`\${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)}L\`;
  if (n >= 1_000) return \`\${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K\`;
  return String(n);
}

export function formatPercent(n: number): string {
  return \`\${(n * 100).toFixed(n * 100 % 1 === 0 ? 0 : 1)}%\`;
}

/** IST label for display. */
export function formatIST(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d) + " IST";
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
`);

w('src/lib/types.ts', `export type Role = "brand" | "creator" | "admin";
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
`);

console.log('core libs done');
