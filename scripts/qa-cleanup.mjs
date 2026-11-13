// Remove throwaway QA accounts created by e2e/admin-gate.spec.ts and everything linked to them.
// Usage: node scripts/qa-cleanup.mjs <qaId>   (matches qa.brand.<id>@redcup.test / qa.creator.<id>@redcup.test only)
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";

const qaId = process.argv[2];
if (!qaId || !/^[a-z0-9]+$/i.test(qaId)) {
  console.error("Pass the QA id (letters/digits only).");
  process.exit(1);
}
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);
const emails = new Set([`qa.brand.${qaId}@redcup.test`, `qa.creator.${qaId}@redcup.test`]);

for (let attempt = 0; attempt < 8; attempt++) {
  const [row] = await sql`SELECT data, EXTRACT(EPOCH FROM updated_at) AS epoch FROM redcup_store WHERE id = 1`;
  const db = row.data;
  const before = Object.fromEntries(Object.entries(db).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
  const userIds = new Set(db.users.filter((u) => emails.has(u.email)).map((u) => u.id));
  const brandIds = new Set(db.brands.filter((b) => userIds.has(b.userId)).map((b) => b.id));
  const creatorIds = new Set(db.creators.filter((c) => userIds.has(c.userId)).map((c) => c.id));
  const campaignIds = new Set(db.campaigns.filter((c) => brandIds.has(c.brandId)).map((c) => c.id));
  const appIds = new Set(
    db.applications.filter((a) => campaignIds.has(a.campaignId) || creatorIds.has(a.creatorId)).map((a) => a.id),
  );
  const draftIds = new Set(db.drafts.filter((d) => appIds.has(d.applicationId)).map((d) => d.id));
  const targets = new Set([...userIds, ...brandIds, ...creatorIds, ...campaignIds, ...appIds, ...draftIds]);

  db.users = db.users.filter((u) => !userIds.has(u.id));
  db.brands = db.brands.filter((b) => !brandIds.has(b.id));
  db.creators = db.creators.filter((c) => !creatorIds.has(c.id));
  db.creatorMetrics = db.creatorMetrics.filter((m) => !creatorIds.has(m.creatorId));
  db.campaigns = db.campaigns.filter((c) => !campaignIds.has(c.id));
  db.applications = db.applications.filter((a) => !appIds.has(a.id));
  db.drafts = db.drafts.filter((d) => !draftIds.has(d.id));
  db.reels = db.reels.filter((r) => !appIds.has(r.applicationId));
  db.ledger = db.ledger.filter(
    (l) => !campaignIds.has(l.campaignId) && !brandIds.has(l.brandId) && !creatorIds.has(l.creatorId) && !appIds.has(l.applicationId),
  );
  db.paymentOrders = db.paymentOrders.filter((p) => !campaignIds.has(p.campaignId) && !brandIds.has(p.brandId));
  db.eligibility = db.eligibility.filter((e) => !campaignIds.has(e.campaignId) && !creatorIds.has(e.creatorId));
  db.shortlistOverrides = db.shortlistOverrides.filter((o) => !appIds.has(o.applicationId));
  db.adminActions = db.adminActions.filter((a) => !targets.has(a.targetId));

  const after = Object.fromEntries(Object.entries(db).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
  const removed = Object.fromEntries(Object.keys(before).map((k) => [k, before[k] - after[k]]).filter(([, n]) => n));
  const res = await sql`
    UPDATE redcup_store SET data = ${JSON.stringify(db)}::jsonb, updated_at = now()
    WHERE id = 1 AND EXTRACT(EPOCH FROM updated_at) = ${Number(row.epoch)} RETURNING id`;
  if (res.length) {
    console.log("removed", removed);
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
}
throw new Error("Could not write after retries");
