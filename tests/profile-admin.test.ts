import { describe, expect, it } from "vitest";
import { mapCategories, toCategory, creatorCategoriesOk, isCategory } from "@/lib/categories";
import { brandHasGst, brandOnboarded, creatorOnboarded } from "@/lib/profile";
import { parseAdminLogins, adminLoginFor, lockedFor, recordFailure, clearFailures, ADMIN_MAX_FAILURES } from "@/server/auth/admin-accounts";
import { rankReels } from "@/server/integrations/instagram";
import { empty, normalizeDb, type Db, type TopReel } from "@/server/db/store";
import { ring1Failures } from "@/server/eligibility/ring1";

describe("categories", () => {
  it("maps obvious free text and keeps unknown values", () => {
    expect(toCategory("beauty")).toBe("Beauty");
    expect(toCategory("Makeup")).toBe("Beauty");
    expect(toCategory("d@c")).toBeNull();
    expect(mapCategories(["beauty", "Lifestyle", "d@c", "Beauty"])).toEqual({ mapped: ["Beauty", "Lifestyle", "d@c"], changed: true });
    expect(mapCategories(["Beauty"]).changed).toBe(false);
    expect(isCategory("Beauty")).toBe(true);
    expect(isCategory("beauty")).toBe(false);
    expect(creatorCategoriesOk([])).toMatch(/at least one/);
    expect(creatorCategoriesOk(["Beauty", "Food", "Tech", "Music"])).toMatch(/up to 3/);
  });

  it("normalizeDb maps stored values without losing the original", () => {
    const db: Db = { ...empty() };
    db.brands.push({ id: "b", userId: "u", businessName: "X", slug: "x", category: "skin care", city: "Pune", gstin: null, kycStatus: "not_submitted", website: null, createdAt: "2026-01-01" });
    db.creators.push({ id: "c", userId: "u2", displayName: "C", handle: "c", city: "", languages: [], categories: ["beauty", "d@c"], level: "listed", panMasked: null, upiMasked: null, createdAt: "2026-01-01" });
    const out = normalizeDb(db);
    expect(out.brands[0].category).toBe("Skincare");
    expect(out.brands[0].categoryRaw).toBe("skin care");
    expect(out.creators[0].categories).toEqual(["Beauty", "d@c"]);
    expect(out.creators[0].categoriesRaw).toEqual(["beauty", "d@c"]);
  });
});

describe("onboarding state", () => {
  it("knows who finished onboarding", () => {
    expect(brandOnboarded({ category: "", city: "" })).toBe(false);
    expect(brandOnboarded({ category: "Beauty", city: "Delhi" })).toBe(true);
    expect(brandOnboarded({ category: "", city: "", onboardedAt: "2026-01-01" })).toBe(true);
    expect(creatorOnboarded({ city: "Delhi", categories: [] })).toBe(false);
    expect(creatorOnboarded({ city: "Delhi", categories: ["Food"] })).toBe(true);
    expect(brandHasGst({ gstin: " " })).toBe(false);
    expect(brandHasGst({ gstin: "27ABCDE1234F1Z5" })).toBe(true);
  });

  it("PAN no longer blocks applying", () => {
    const fails = ring1Failures({
      creatorId: "c", followers: 1000, accountType: "CREATOR", accountAgeDays: 400, mediaCount: 50,
      avgReelViews10: null, engagementRate10: null, audienceCountryPct: null, audienceCityPct: null, audienceGenderAge: null,
      niches: [], nicheVerified: [], languages: [], city: null, whatsapp: "9999999999", pan: null, upi: "a@upi",
      redcupScore: null, onTimeRate: null, firstDraftRate: null, qualityRating: null, fraudFlagsUpheld: 0,
      competitorHistory: [], igConnected: true, tokenValid: true, refreshedAt: "",
    });
    expect(fails.find((f) => f.code === "PROFILE_INCOMPLETE")).toBeUndefined();
  });
});

describe("admin logins", () => {
  it("parses ADMIN_LOGINS defensively", () => {
    expect(parseAdminLogins(undefined)).toEqual([]);
    expect(parseAdminLogins("not json")).toEqual([]);
    expect(parseAdminLogins('[{"email":"A@x.com","password":"longenough"},{"email":"bad","password":"longenough"},{"email":"b@x.com","password":"short"},{"email":"c@x.com","password":""}]')).toEqual([
      { email: "a@x.com", password: "longenough" },
      { email: "b@x.com", password: "short" },
    ]);
    const env = { ADMIN_LOGINS: '[{"email":"a@x.com","password":"longenough"}]', ADMIN_BOOTSTRAP_EMAIL: "boot@x.com", ADMIN_BOOTSTRAP_PASSWORD: "bootpass1" } as unknown as NodeJS.ProcessEnv;
    expect(adminLoginFor("A@X.com", env)?.email).toBe("a@x.com");
    expect(adminLoginFor("boot@x.com", env)?.password).toBe("bootpass1");
    expect(adminLoginFor("nobody@x.com", env)).toBeNull();
  });

  it("locks out after repeated failures and clears on success", () => {
    const db: Db = { ...empty() };
    const keys = ["email:x", "ip:y"];
    const t0 = Date.parse("2026-11-13T10:00:00Z");
    for (let i = 1; i < ADMIN_MAX_FAILURES; i++) expect(recordFailure(db, keys, t0 + i)).toBe(false);
    expect(lockedFor(db, keys, t0 + 10)).toBe(0);
    expect(recordFailure(db, keys, t0 + 20)).toBe(true);
    expect(lockedFor(db, keys, t0 + 30)).toBeGreaterThan(0);
    clearFailures(db, keys);
    expect(lockedFor(db, keys, t0 + 30)).toBe(0);
  });
});

describe("top reels", () => {
  const r = (id: string, views: number | null, likes: number | null): TopReel => ({
    mediaId: id, permalink: `https://www.instagram.com/reel/${id}/`, caption: null, thumbnailUrl: null, postedAt: null, views, likes, comments: 0,
  });
  it("ranks by views, then engagement, and caps at 5", () => {
    const out = rankReels([r("a", 10, 1), r("b", 500, 1), r("c", null, 900), r("d", 50, 1), r("e", 40, 1), r("f", 30, 1)]);
    expect(out.map((x) => x.mediaId)).toEqual(["b", "d", "e", "f", "a"]);
    expect(rankReels([r("x", null, 5), r("y", null, 50)]).map((x) => x.mediaId)).toEqual(["y", "x"]);
  });
});
