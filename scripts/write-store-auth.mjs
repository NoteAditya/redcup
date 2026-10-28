import fs from 'fs';
import path from 'path';
const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

w('src/server/db/store.ts', `import { promises as fs } from "fs";
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

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memory: Db | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function ensure(): Promise<Db> {
  if (memory) return memory;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf8");
    memory = JSON.parse(raw) as Db;
  } catch {
    memory = empty();
    await persist();
  }
  return memory!;
}

function persist(): Promise<void> {
  writeChain = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(memory, null, 2));
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
  return \`\${prefix}_\${nanoid(10)}\`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** When DATABASE_URL is set, Neon is preferred — surface that clearly. */
export function dbMode(): "file" | "neon-ready" {
  return process.env.DATABASE_URL ? "neon-ready" : "file";
}
`);

w('src/server/auth/session.ts', `import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@/lib/types";

export type SessionData = {
  userId?: string;
  role?: Role;
  name?: string;
  isLoggedIn: boolean;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-session-secret-change-me-32chars!!",
  cookieName: "redcup_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getSession() {
  const jar = await cookies();
  return getIronSession<SessionData>(jar, sessionOptions);
}

export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    throw new Error("UNAUTHORIZED");
  }
  if (roles && !roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session as SessionData & { userId: string; role: Role; name: string };
}
`);

w('src/server/auth/actions.ts', `"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { id, nowIso, updateDb } from "@/server/db/store";
import { getSession } from "./session";

function normalizeContact(contact: string) {
  return contact.trim().toLowerCase();
}

export async function demoSignUp(input: {
  role: "brand" | "creator";
  name: string;
  email?: string;
  phone?: string;
  password: string;
}) {
  const contact = input.email || input.phone;
  if (!contact || input.password.length < 6) {
    return { ok: false as const, error: "Email or phone and a password of 6+ characters are required." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userId = id("usr");

  const result = await updateDb((db) => {
    const exists = db.users.find(
      (u) =>
        (input.email && u.email === normalizeContact(input.email)) ||
        (input.phone && u.phone === input.phone.trim()),
    );
    if (exists) return { ok: false as const, error: "An account with that contact already exists." };

    db.users.push({
      id: userId,
      role: input.role,
      email: input.email ? normalizeContact(input.email) : null,
      phone: input.phone?.trim() || null,
      name: input.name.trim(),
      status: "active",
      passwordHash,
      createdAt: nowIso(),
    });

    if (input.role === "brand") {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "brand";
      db.brands.push({
        id: id("br"),
        userId,
        businessName: input.name.trim(),
        slug: \`\${slug}-\${userId.slice(-4)}\`,
        category: "",
        city: "",
        gstin: null,
        kycStatus: "not_submitted",
        website: null,
        createdAt: nowIso(),
      });
    } else {
      const handle = (input.name.replace(/\\s+/g, "").toLowerCase() || "creator") + userId.slice(-4);
      db.creators.push({
        id: id("cr"),
        userId,
        displayName: input.name.trim(),
        handle,
        city: "",
        languages: [],
        categories: [],
        level: "listed",
        panMasked: null,
        upiMasked: null,
        createdAt: nowIso(),
      });
    }
    return { ok: true as const };
  });

  if (!result.ok) return result;

  const session = await getSession();
  session.userId = userId;
  session.role = input.role;
  session.name = input.name.trim();
  session.isLoggedIn = true;
  await session.save();

  redirect(input.role === "brand" ? "/brand/onboarding" : "/creator/onboarding");
}

export async function demoSignIn(input: { contact: string; password: string }) {
  const contact = normalizeContact(input.contact);
  const dbUser = await updateDb((db) => {
    return (
      db.users.find(
        (u) => u.email === contact || u.phone === input.contact.trim() || u.email === input.contact.trim(),
      ) || null
    );
  });

  // re-read without mutation race
  const { readDb } = await import("@/server/db/store");
  const db = await readDb();
  const user =
    db.users.find(
      (u) =>
        (u.email && u.email === contact) ||
        (u.phone && u.phone === input.contact.trim()),
    ) || null;

  if (!user?.passwordHash) {
    return { ok: false as const, error: "No account found for that contact." };
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return { ok: false as const, error: "Wrong password." };

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  session.isLoggedIn = true;
  await session.save();

  if (user.role === "brand") redirect("/brand");
  if (user.role === "creator") redirect("/creator");
  redirect("/admin");
}

export async function signOut() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

export async function requestOtp(contact: string) {
  if (!process.env.RESEND_API_KEY && !process.env.SMS_API_KEY) {
    return {
      ok: false as const,
      needsConnect: true as const,
      provider: contact.includes("@") ? "Resend (email OTP)" : "MSG91 / Twilio (SMS OTP)",
      message:
        "OTP login needs an email or SMS provider key. Use demo password sign-in for now, or add RESEND_API_KEY / SMS_API_KEY.",
    };
  }
  // Real send would go here when keys exist.
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await updateDb((db) => {
    db.otps = db.otps.filter((o) => o.contact !== normalizeContact(contact));
    db.otps.push({
      contact: normalizeContact(contact),
      code,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    });
  });
  return { ok: true as const, demoCode: process.env.NODE_ENV === "production" ? undefined : code };
}

void dbUser;
`);

console.log('store+auth done');
