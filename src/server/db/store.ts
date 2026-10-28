import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type {
  ApplicationStatus,
  BrandKyc,
  CampaignCriteria,
  CampaignStatus,
  CreatorLevel,
  CreatorMetrics,
  EligibilityResult,
  FitBreakdown,
  Role,
} from "@/lib/types";

export type User = {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  name: string;
  status: "active" | "inactive";
  passwordHash?: string;
  createdAt: string;
};

export type Brand = {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  category: string;
  city: string;
  gstin: string | null;
  kycStatus: BrandKyc;
  website: string | null;
  createdAt: string;
};

export type Creator = {
  id: string;
  userId: string;
  displayName: string;
  handle: string;
  city: string;
  languages: string[];
  categories: string[];
  level: CreatorLevel;
  panMasked: string | null;
  upiMasked: string | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  brandId: string;
  slug: string;
  title: string;
  brief: string;
  dosDonts: string;
  ratePer1000Paise: number;
  budgetPaise: number;
  basePaise: number;
  capPerCreatorPaise: number;
  slots: number;
  criteria: CampaignCriteria;
  presetId: string | null;
  status: CampaignStatus;
  applicationClosesAt: string | null;
  awardDeadlineAt: string | null;
  createdAt: string;
  fundedAt: string | null;
};

export type Application = {
  id: string;
  campaignId: string;
  creatorId: string;
  status: ApplicationStatus;
  appliedAt: string;
  criteriaSnapshot: CampaignCriteria;
  metricsSnapshot: CreatorMetrics;
  fitScore: number | null;
  fitBreakdown: FitBreakdown | null;
  awardDeadlineAt: string | null;
};

export type Draft = {
  id: string;
  applicationId: string;
  videoPath: string;
  caption: string;
  version: 1 | 2;
  reviewStatus: "pending" | "approved" | "revision" | "rejected";
  reviewReason: string | null;
  createdAt: string;
};

export type Reel = {
  id: string;
  applicationId: string;
  permalink: string;
  postedAt: string;
  hasPaidPartnershipLabel: boolean | null;
  finalViews: number | null;
};

export type LedgerEntry = {
  id: string;
  type: string;
  amountPaise: number;
  campaignId: string | null;
  applicationId: string | null;
  brandId: string | null;
  creatorId: string | null;
  createdAt: string;
  note: string | null;
};

export type PaymentOrder = {
  id: string;
  campaignId: string;
  brandId: string;
  budgetPaise: number;
  feePaise: number;
  gstPaise: number;
  prizePaise: number;
  totalPaise: number;
  provider: string;
  providerOrderId: string | null;
  status: "created" | "paid" | "failed";
  createdAt: string;
};

export type EligibilityRow = {
  campaignId: string;
  creatorId: string;
  status: EligibilityResult["status"];
  reasons: EligibilityResult["reasons"];
  computedAt: string;
};

export type Db = {
  users: User[];
  brands: Brand[];
  creators: Creator[];
  creatorMetrics: CreatorMetrics[];
  campaigns: Campaign[];
  applications: Application[];
  drafts: Draft[];
  reels: Reel[];
  ledger: LedgerEntry[];
  paymentOrders: PaymentOrder[];
  eligibility: EligibilityRow[];
  shortlistOverrides: {
    id: string;
    applicationId: string;
    action: "pin" | "remove";
    reason: string;
    adminId: string;
    createdAt: string;
  }[];
  adminActions: {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason: string;
    createdAt: string;
  }[];
  otps: { contact: string; code: string; expiresAt: string }[];
};

const empty = (): Db => ({
  users: [],
  brands: [],
  creators: [],
  creatorMetrics: [],
  campaigns: [],
  applications: [],
  drafts: [],
  reels: [],
  ledger: [],
  paymentOrders: [],
  eligibility: [],
  shortlistOverrides: [],
  adminActions: [],
  otps: [],
});

function dataDir(): string {
  // Vercel is read-only except /tmp; local/dev uses ./data
  if (process.env.VERCEL || process.env.DATA_DIR === "/tmp") {
    return "/tmp/redcup-data";
  }
  return path.join(process.cwd(), "data");
}

const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

function storePath(): string {
  return path.join(dataDir(), "store.json");
}

let memory: Db | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function ensure(): Promise<Db> {
  if (memory) return memory;
  const STORE_PATH = storePath();
  try {
    await fs.mkdir(dataDir(), { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf8");
    memory = JSON.parse(raw) as Db;
  } catch {
    try {
      const seed = await fs.readFile(SEED_PATH, "utf8");
      memory = JSON.parse(seed) as Db;
    } catch {
      memory = empty();
    }
    await persist();
  }
  return memory!;
}

function persist(): Promise<void> {
  writeChain = writeChain.then(async () => {
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.writeFile(storePath(), JSON.stringify(memory, null, 2));
  });
  return writeChain;
}

export async function readDb(): Promise<Db> {
  return ensure();
}

export async function updateDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const db = await ensure();
  const result = await fn(db);
  await persist();
  return result;
}

export function id(prefix: string): string {
  return `${prefix}_${nanoid(10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** When DATABASE_URL is set, Neon is preferred — surface that clearly. */
export function dbMode(): "file" | "neon-ready" {
  return process.env.DATABASE_URL ? "neon-ready" : "file";
}
