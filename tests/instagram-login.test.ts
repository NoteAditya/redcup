import { beforeEach, expect, test, vi } from "vitest";
import { empty, type Db } from "@/server/db/store";

let db: Db;
vi.mock("@/server/db/store", async (orig) => {
  const real = await orig<typeof import("@/server/db/store")>();
  return {
    ...real,
    readDb: async () => db,
    updateDb: async <T,>(fn: (d: Db) => T | Promise<T>) => fn(db),
  };
});

const { completeInstagramLogin } = await import("@/server/auth/instagram-login");

const profile = {
  igUserId: "1784",
  username: "ananya.creates",
  name: "Ananya",
  accountType: "PROFESSIONAL" as const,
  biography: "bio",
  website: null,
  followers: 15200,
  follows: 300,
  mediaCount: 88,
  profilePictureUrl: "https://scontent.cdninstagram.com/x.jpg",
};
const tok = { token: "tkn", expiresAt: null, flow: "unified" as const };

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "z".repeat(40));
  db = empty();
});

test("new Instagram login creates a creator with real Instagram numbers and a sealed token", async () => {
  const r = await completeInstagramLogin(profile, tok, "biz1");
  expect(r.ok && r.created).toBe(true);
  expect(db.users[0]).toMatchObject({ role: "creator", email: null, name: "Ananya" });
  const c = db.creators[0];
  expect(c.handle).toBe("ananya.creates");
  expect(c.instagram?.tokenSealed).toBeTruthy();
  expect(c.instagram?.tokenSealed).not.toContain("tkn");
  expect(db.creatorMetrics[0]).toMatchObject({ followers: 15200, mediaCount: 88, igConnected: true, tokenValid: true });
  // second login finds the same creator
  const again = await completeInstagramLogin({ ...profile, followers: 16000 }, tok, null);
  expect(again.ok && !again.created).toBe(true);
  expect(db.creators).toHaveLength(1);
  expect(db.creatorMetrics[0].followers).toBe(16000);
});

test("older email creator with the same handle is linked, kept and noted for admins", async () => {
  db.users.push({ id: "usr_old", role: "creator", email: "a@x.in", phone: null, name: "Old", status: "active", createdAt: "2026-10-01T00:00:00Z" });
  db.creators.push({
    id: "cr_old", userId: "usr_old", displayName: "Old", handle: "Ananya.Creates", city: "Mumbai",
    languages: ["Hindi"], categories: ["Beauty"], level: "listed", panMasked: "****234F", upiMasked: null, createdAt: "2026-10-01T00:00:00Z",
  });
  const r = await completeInstagramLogin(profile, tok, null);
  expect(r.ok && r.linkedExisting).toBe(true);
  expect(db.users).toHaveLength(1);
  expect(db.creators[0].city).toBe("Mumbai");
  expect(db.creators[0].instagram?.linkNote).toMatch(/matched the handle/);
  expect(db.adminActions.some((a) => a.action === "creator_instagram_link")).toBe(true);
});

test("deactivated creators are refused", async () => {
  await completeInstagramLogin(profile, tok, null);
  db.users[0].status = "inactive";
  const r = await completeInstagramLogin(profile, tok, null);
  expect(r).toEqual({ ok: false, reason: "deactivated" });
});
