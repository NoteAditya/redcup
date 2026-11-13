import { test, expect, vi } from "vitest";
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/server/auth/clerk-sync", () => ({ syncClerkToLocalUser: async () => ({ ok: false, reason: "no_clerk" }) }));

test("SESSION_SECRET is mandatory in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SESSION_SECRET", "");
  const m = await import("@/server/auth/session");
  expect(() => m.sessionOptions.password).toThrow(/SESSION_SECRET/);
  vi.stubEnv("SESSION_SECRET", "x".repeat(40));
  expect(m.sessionOptions.password).toHaveLength(40);
  vi.unstubAllEnvs();
});
