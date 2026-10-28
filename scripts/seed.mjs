/**
 * Bootstrap only the real admin account — never invent demo brands/creators.
 * Requires ADMIN_BOOTSTRAP_EMAIL + ADMIN_BOOTSTRAP_PASSWORD in the environment
 * (or .env.local). Uses Neon when DATABASE_URL is set.
 */
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

function id(prefix) {
  return `${prefix}_${nanoid(10)}`;
}

const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
if (!email || !password) {
  console.error("Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before seeding.");
  process.exit(1);
}

const empty = () => ({
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

const passwordHash = await bcrypt.hash(password, 10);
const db = empty();
db.users.push({
  id: id("usr"),
  role: "admin",
  email,
  phone: null,
  name: "RedCup Admin",
  status: "active",
  passwordHash,
  createdAt: new Date().toISOString(),
});

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (url) {
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS redcup_store (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO redcup_store (id, data, updated_at)
    VALUES (1, ${JSON.stringify(db)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
  console.log("Bootstrapped admin on Neon:", email);
} else {
  const DATA_DIR = path.join(process.cwd(), "data");
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "store.json"), JSON.stringify(db, null, 2));
  console.log("Bootstrapped admin on file store:", email);
}
