import { createHmac } from "crypto";
import { afterEach, expect, test, vi } from "vitest";
import { open, seal } from "@/server/crypto/secretbox";
import {
  instagramAuthUrl,
  instagramConfig,
  instagramRedirectUri,
  parseSignedRequest,
  shortcodeFromPermalink,
} from "@/server/integrations/instagram";

afterEach(() => vi.unstubAllEnvs());

test("tokens are sealed with AES-GCM and only open with the same SESSION_SECRET", () => {
  vi.stubEnv("SESSION_SECRET", "a".repeat(40));
  const sealed = seal("IGQ-test-token");
  expect(sealed).not.toContain("IGQ-test-token");
  expect(open(sealed)).toBe("IGQ-test-token");
  expect(open(sealed.slice(0, -2) + "xx")).toBeNull();
  vi.stubEnv("SESSION_SECRET", "b".repeat(40));
  expect(open(sealed)).toBeNull();
});

test("unified login uses the Facebook dialog with config_id and no scope", () => {
  vi.stubEnv("INSTAGRAM_APP_ID", "111");
  vi.stubEnv("INSTAGRAM_APP_SECRET", "s");
  vi.stubEnv("INSTAGRAM_CONFIG_ID", "222");
  const cfg = instagramConfig();
  expect(cfg?.flow).toBe("unified");
  const url = new URL(instagramAuthUrl("st", "https://x.test/api/auth/instagram/callback", cfg)!);
  expect(url.hostname).toBe("www.facebook.com");
  expect(url.pathname).toMatch(/\/dialog\/oauth$/);
  expect(url.searchParams.get("client_id")).toBe("111");
  expect(url.searchParams.get("config_id")).toBe("222");
  expect(url.searchParams.get("state")).toBe("st");
  expect(url.searchParams.has("scope")).toBe(false);
});

test("Instagram Login flow is available behind INSTAGRAM_LOGIN_FLOW", () => {
  vi.stubEnv("INSTAGRAM_APP_ID", "111");
  vi.stubEnv("INSTAGRAM_APP_SECRET", "s");
  vi.stubEnv("INSTAGRAM_CONFIG_ID", "");
  vi.stubEnv("INSTAGRAM_LOGIN_FLOW", "instagram");
  const url = new URL(instagramAuthUrl("st", "https://x.test/cb")!);
  expect(url.hostname).toBe("www.instagram.com");
  expect(url.searchParams.get("scope")).toBe("instagram_business_basic,instagram_business_manage_insights");
});

test("redirect uri prefers INSTAGRAM_REDIRECT_URI, then APP_URL, then origin", () => {
  vi.stubEnv("INSTAGRAM_REDIRECT_URI", "");
  vi.stubEnv("APP_URL", "");
  expect(instagramRedirectUri("http://localhost:3000")).toBe("http://localhost:3000/api/auth/instagram/callback");
  vi.stubEnv("APP_URL", "https://redcup.example/");
  expect(instagramRedirectUri("http://localhost:3000")).toBe("https://redcup.example/api/auth/instagram/callback");
  vi.stubEnv("INSTAGRAM_REDIRECT_URI", "https://other.example/cb");
  expect(instagramRedirectUri("http://localhost:3000")).toBe("https://other.example/cb");
});

test("Meta signed_request is verified with the app secret", () => {
  const payload = Buffer.from(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: "17841400000000000" })).toString("base64url");
  const sig = createHmac("sha256", "secret").update(payload).digest("base64url");
  expect(parseSignedRequest(`${sig}.${payload}`, "secret")?.user_id).toBe("17841400000000000");
  expect(parseSignedRequest(`${sig}.${payload}`, "wrong")).toBeNull();
  expect(parseSignedRequest("garbage", "secret")).toBeNull();
});

test("reel permalinks match by shortcode", () => {
  expect(shortcodeFromPermalink("https://www.instagram.com/reel/C9abc_12-x/?igsh=1")).toBe("C9abc_12-x");
  expect(shortcodeFromPermalink("https://instagram.com/p/C9abc_12-x/")).toBe("C9abc_12-x");
  expect(shortcodeFromPermalink("https://www.instagram.com/someone/reel/C9abc_12-x/")).toBe("C9abc_12-x");
  expect(shortcodeFromPermalink("https://example.com/x")).toBeNull();
});

test("follower demographics become percentages keyed the way criteria expect", async () => {
  vi.stubEnv("INSTAGRAM_APP_ID", "111");
  vi.stubEnv("INSTAGRAM_APP_SECRET", "s");
  vi.stubEnv("INSTAGRAM_CONFIG_ID", "222");
  const { fetchAudience } = await import("@/server/integrations/instagram");
  const replies: Record<string, unknown> = {
    country: [{ dimension_values: ["IN"], value: 75 }, { dimension_values: ["US"], value: 25 }],
    city: [{ dimension_values: ["Mumbai, Maharashtra"], value: 30 }, { dimension_values: ["Delhi, Delhi"], value: 10 }],
    gender: [{ dimension_values: ["F"], value: 60 }, { dimension_values: ["M"], value: 40 }],
  };
  const fetchMock = vi.fn(async (url: URL) => {
    const b = url.searchParams.get("breakdown")!;
    expect(url.hostname).toBe("graph.facebook.com");
    expect(url.searchParams.get("appsecret_proof")).toBeTruthy();
    return new Response(JSON.stringify({ data: [{ total_value: { breakdowns: [{ results: replies[b] }] } }] }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  const a = await fetchAudience("tok", "unified", "1784");
  expect(a.countryPct).toEqual({ IN: 75, US: 25 });
  expect(a.cityPct).toEqual({ Mumbai: 75, Delhi: 25 });
  expect(a.genderPct).toEqual({ female: 60, male: 40 });
  vi.unstubAllGlobals();
});
