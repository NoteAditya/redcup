// QA only: create (or reuse) the throwaway creator for e2e/admin-gate.spec.ts and print a sealed
// RedCup session cookie for it, as if it had logged in with Instagram. Real creators can only get
// this cookie through /api/auth/instagram/callback; this script needs SESSION_SECRET and the
// database URL from .env.local, so it only runs on a machine that already holds production secrets.
// Usage: node scripts/qa-creator-session.mjs <qaId>   → prints the cookie value on stdout.
// The account uses qa.creator.<id>@redcup.test, so scripts/qa-cleanup.mjs removes it.
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { sealData } from "iron-session";
import { nanoid } from "nanoid";

const qaId = process.argv[2];
if (!qaId || !/^[a-z0-9]+$/i.test(qaId)) {
  console.error("Pass the QA id (letters/digits only).");
  process.exit(1);
}
const secret = process.env.SESSION_SECRET || "";
if (secret.length < 32) throw new Error("SESSION_SECRET missing");
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);
const email = `qa.creator.${qaId}@redcup.test`;
const name = `QA Creator ${qaId}`;
const now = new Date().toISOString();

let userId = null;
for (let attempt = 0; attempt < 8 && !userId; attempt++) {
  const [row] = await sql`SELECT data, EXTRACT(EPOCH FROM updated_at) AS epoch FROM redcup_store WHERE id = 1`;
  const db = row.data;
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    userId = existing.id;
    break;
  }
  const uid = `usr_${nanoid(10)}`;
  db.users.push({ id: uid, role: "creator", email, phone: null, name, status: "active", createdAt: now });
  db.creators.push({
    id: `cr_${nanoid(10)}`,
    userId: uid,
    displayName: name,
    handle: `qacreator${qaId}`.toLowerCase(),
    city: "",
    languages: [],
    categories: [],
    level: "listed",
    panMasked: null,
    upiMasked: null,
    createdAt: now,
  });
  const res = await sql`
    UPDATE redcup_store SET data = ${JSON.stringify(db)}::jsonb, updated_at = now()
    WHERE id = 1 AND EXTRACT(EPOCH FROM updated_at) = ${Number(row.epoch)} RETURNING id`;
  if (res.length) userId = uid;
  else await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
}
if (!userId) throw new Error("Could not create QA creator");

const seal = await sealData(
  { userId, role: "creator", name, isLoggedIn: true, via: "instagram" },
  { password: secret, ttl: 60 * 60 * 24 * 14 },
);
process.stdout.write(seal);
