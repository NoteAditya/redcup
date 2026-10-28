import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function id(prefix) {
  return `${prefix}_${nanoid(10)}`;
}
function now() {
  return new Date().toISOString();
}

const passwordHash = await bcrypt.hash("redcup123", 10);

const adminId = id("usr");
const brandUserId = id("usr");
const brandId = id("br");
const creators = [];
const metrics = [];
const users = [
  {
    id: adminId,
    role: "admin",
    email: "thenoteaditya@gmail.com",
    phone: null,
    name: "Aditya Admin",
    status: "active",
    passwordHash,
    createdAt: now(),
  },
  {
    id: brandUserId,
    role: "brand",
    email: "brand@demo.redcup",
    phone: null,
    name: "Demo Skincare Co",
    status: "active",
    passwordHash,
    createdAt: now(),
  },
];

const brand = {
  id: brandId,
  userId: brandUserId,
  businessName: "Demo Skincare Co",
  slug: "demo-skincare",
  category: "Beauty",
  city: "Mumbai",
  gstin: "27AABCU9603R1ZM",
  kycStatus: "approved",
  website: "https://example.com",
  createdAt: now(),
};

const seedCreators = [
  { name: "Ananya Beauty", handle: "ananya.beauty", city: "Delhi", cats: ["Beauty", "Skincare"], langs: ["Hindi", "English"], followers: 22000, views: 9000, eng: 0.042 },
  { name: "Rohit Eats", handle: "rohiteats", city: "Mumbai", cats: ["Food", "Cafe"], langs: ["Hindi", "English"], followers: 8000, views: 4500, eng: 0.05 },
  { name: "Kavya Glow", handle: "kavyaglow", city: "Bengaluru", cats: ["Beauty", "Lifestyle"], langs: ["English", "Kannada"], followers: 35000, views: 14000, eng: 0.031 },
  { name: "Isha Nano", handle: "ishanano", city: "Pune", cats: ["Beauty"], langs: ["Hindi"], followers: 4500, views: 1800, eng: 0.055 },
];

for (const c of seedCreators) {
  const uid = id("usr");
  const cid = id("cr");
  users.push({
    id: uid,
    role: "creator",
    email: `${c.handle}@demo.redcup`,
    phone: null,
    name: c.name,
    status: "active",
    passwordHash,
    createdAt: now(),
  });
  creators.push({
    id: cid,
    userId: uid,
    displayName: c.name,
    handle: c.handle,
    city: c.city,
    languages: c.langs,
    categories: c.cats,
    level: "verified",
    panMasked: "****1234",
    upiMasked: "****upi",
    createdAt: now(),
  });
  metrics.push({
    creatorId: cid,
    followers: c.followers,
    accountType: "CREATOR",
    accountAgeDays: 400,
    mediaCount: 40,
    avgReelViews10: c.views,
    engagementRate10: c.eng,
    audienceCountryPct: { IN: 82 },
    audienceCityPct: { [c.city]: 28 },
    audienceGenderAge: { female: 62, male: 38 },
    niches: c.cats,
    nicheVerified: [c.cats[0]],
    languages: c.langs,
    city: c.city,
    whatsapp: "+919999000000",
    pan: "ABCDE1234F",
    upi: `${c.handle}@upi`,
    redcupScore: 72,
    onTimeRate: 0.95,
    firstDraftRate: 0.8,
    qualityRating: 4.4,
    fraudFlagsUpheld: 0,
    competitorHistory: [],
    igConnected: true,
    tokenValid: true,
    refreshedAt: now(),
  });
}

const campaignId = id("cmp");
const campaign = {
  id: campaignId,
  brandId,
  slug: "weekend-skincare-reel-demo",
  title: "Weekend skincare reel",
  brief: "Show your AM routine with our vitamin C serum. Keep it under 30s. Natural light preferred.",
  dosDonts: "Do: paid partnership label, speak Hindi or English.\\nDon't: mention competitor brands.",
  ratePer1000Paise: 80000,
  budgetPaise: 2500000,
  basePaise: 150000,
  capPerCreatorPaise: 1500000,
  slots: 2,
  criteria: {
    followers: { mode: "must", min: 10000, max: 50000 },
    niches: { mode: "must", any_of: ["Beauty", "Skincare"] },
    audience_country: { mode: "must", country: "IN", min_pct: 60 },
    languages: { mode: "nice", any_of: ["Hindi", "English"] },
    avg_reel_views: { mode: "nice", min: 3000 },
  },
  presetId: "beauty_micro",
  status: "live",
  applicationClosesAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  awardDeadlineAt: null,
  createdAt: now(),
  fundedAt: now(),
};

const db = {
  users,
  brands: [brand],
  creators,
  creatorMetrics: metrics,
  campaigns: [campaign],
  applications: [],
  drafts: [],
  reels: [],
  ledger: [
    {
      id: id("led"),
      type: "funding",
      amountPaise: campaign.budgetPaise,
      campaignId,
      applicationId: null,
      brandId,
      creatorId: null,
      createdAt: now(),
      note: "Seed funding",
    },
  ],
  paymentOrders: [],
  eligibility: [],
  shortlistOverrides: [],
  adminActions: [],
  otps: [],
};

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.writeFile(STORE_PATH, JSON.stringify(db, null, 2));
console.log("Seeded", STORE_PATH);
console.log("Demo passwords: redcup123");
console.log("Admin:", "thenoteaditya@gmail.com");
console.log("Brand:", "brand@demo.redcup");
console.log("Creators:", seedCreators.map((c) => c.handle + "@demo.redcup").join(", "));
