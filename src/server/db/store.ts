import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
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

export const empty = (): Db => ({
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
  if (process.env.VERCEL || process.env.DATA_DIR === "/tmp") {
    return "/tmp/redcup-data";
  }
  return path.join(process.cwd(), "data");
}

function storePath(): string {
  return path.join(dataDir(), "store.json");
}

let memory: Db | null = null;
let writeChain: Promise<void> = Promise.resolve();
let schemaReady = false;
let sqlClient: NeonQueryFunction<false, false> | null | undefined;

function getSql(): NeonQueryFunction<false, false> | null {
  if (sqlClient !== undefined) return sqlClient;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!url) {
    sqlClient = null;
    return null;
  }
  sqlClient = neon(url);
  return sqlClient;
}

export function dbMode(): "neon" | "file" {
  return getSql() ? "neon" : "file";
}

async function ensureSchema(sql: NeonQueryFunction<false, false>) {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS redcup_store (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  schemaReady = true;
}

async function bootstrapAdminIfNeeded(db: Db): Promise<Db> {
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
  if (!email || !password) return db;
  if (db.users.some((u) => u.role === "admin")) return db;

  // Lazy import so bcrypt stays server-only and build does not pull crypto incorrectly
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 10);
  db.users.push({
    id: id("usr"),
    role: "admin",
    email,
    phone: null,
    name: "RedCup Admin",
    status: "active",
    passwordHash,
    createdAt: nowIso(),
  });
  return db;
}

async function loadFromNeon(sql: NeonQueryFunction<false, false>): Promise<Db> {
  await ensureSchema(sql);
  const rows = await sql`SELECT data FROM redcup_store WHERE id = 1`;
  if (!rows.length) {
    const db = await bootstrapAdminIfNeeded(empty());
    await sql`INSERT INTO redcup_store (id, data) VALUES (1, ${JSON.stringify(db)}::jsonb)
              ON CONFLICT (id) DO NOTHING`;
    return db;
  }
  const db = rows[0].data as Db;
  // Ensure all keys exist for older documents
  return { ...empty(), ...db };
}

async function saveToNeon(sql: NeonQueryFunction<false, false>, db: Db) {
  await ensureSchema(sql);
  await sql`
    INSERT INTO redcup_store (id, data, updated_at)
    VALUES (1, ${JSON.stringify(db)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

async function loadFromFile(): Promise<Db> {
  try {
    await fs.mkdir(dataDir(), { recursive: true });
    const raw = await fs.readFile(storePath(), "utf8");
    return { ...empty(), ...(JSON.parse(raw) as Db) };
  } catch {
    // Empty local store — no fake seed. Admin is bootstrapped when env is set.
    const db = await bootstrapAdminIfNeeded(empty());
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.writeFile(storePath(), JSON.stringify(db, null, 2));
    return db;
  }
}

async function saveToFile(db: Db) {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(db, null, 2));
}

async function ensureFile(): Promise<Db> {
  if (memory) return memory;
  memory = await loadFromFile();
  return memory!;
}

function persistFile(): Promise<void> {
  writeChain = writeChain.then(async () => {
    if (!memory) return;
    await saveToFile(memory);
  });
  return writeChain;
}

function toIsoTs(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function loadFromNeonVersioned(
  sql: NeonQueryFunction<false, false>,
): Promise<{ db: Db; updatedAt: string | null }> {
  await ensureSchema(sql);
  const rows = await sql`SELECT data, updated_at FROM redcup_store WHERE id = 1`;
  if (!rows.length) {
    const db = await bootstrapAdminIfNeeded(empty());
    await sql`INSERT INTO redcup_store (id, data) VALUES (1, ${JSON.stringify(db)}::jsonb)
              ON CONFLICT (id) DO NOTHING`;
    const again = await sql`SELECT data, updated_at FROM redcup_store WHERE id = 1`;
    return {
      db: again.length ? ({ ...empty(), ...(again[0].data as Db) } as Db) : db,
      updatedAt: again.length ? toIsoTs(again[0].updated_at) : null,
    };
  }
  return {
    db: { ...empty(), ...(rows[0].data as Db) } as Db,
    updatedAt: toIsoTs(rows[0].updated_at),
  };
}

async function saveToNeonOptimistic(
  sql: NeonQueryFunction<false, false>,
  db: Db,
  expectedUpdatedAt: string | null,
): Promise<boolean> {
  await ensureSchema(sql);
  if (!expectedUpdatedAt) {
    await saveToNeon(sql, db);
    return true;
  }
  const rows = await sql`
    UPDATE redcup_store
    SET data = ${JSON.stringify(db)}::jsonb, updated_at = now()
    WHERE id = 1 AND updated_at = ${expectedUpdatedAt}::timestamptz
    RETURNING id
  `;
  return rows.length > 0;
}

export async function readDb(): Promise<Db> {
  const sql = getSql();
  // Serverless: never trust process memory across invocations — always read Neon.
  if (sql) {
    const { db } = await loadFromNeonVersioned(sql);
    memory = db;
    return db;
  }
  return ensureFile();
}

export async function updateDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const sql = getSql();
  if (!sql) {
    const db = await ensureFile();
    const result = await fn(db);
    await persistFile();
    return result;
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt++) {
    const { db, updatedAt } = await loadFromNeonVersioned(sql);
    const result = await fn(db);
    const ok = await saveToNeonOptimistic(sql, db, updatedAt);
    if (ok) {
      memory = db;
      return result;
    }
    lastError = new Error("optimistic lock conflict");
    await new Promise((r) => setTimeout(r, 40 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to persist RedCup store");
}

/** Force reload from Neon/file (tests / scripts). */
export function resetMemoryCache() {
  memory = null;
  schemaReady = false;
}

export function id(prefix: string): string {
  return `${prefix}_${nanoid(10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
