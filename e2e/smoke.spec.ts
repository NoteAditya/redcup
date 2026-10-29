import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import fs from "fs";
import path from "path";

const ART = "/workspace/om-app/artifacts";
fs.mkdirSync(ART, { recursive: true });

function stamp() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

async function noConsoleErrors(page: Page) {
  const errors: string[] = [];
  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") errors.push(msg.text());
  };
  const onPageError = (err: Error) => errors.push(err.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  return () => {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    const filtered = errors.filter(
      (e) =>
        !/favicon/i.test(e) &&
        !/Download the React DevTools/i.test(e) &&
        !/third-party/i.test(e),
    );
    expect(filtered, filtered.join("\n")).toEqual([]);
  };
}


async function signIn(page: Page, contact: string, password: string, expectPath?: RegExp) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.locator("#contact").fill(contact);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 }),
    page.getByRole("button", { name: /^Sign in$/i }).click(),
  ]);
  if (expectPath) {
    await expect(page).toHaveURL(expectPath, { timeout: 15_000 });
  }
}

async function shot(page: Page, name: string) {
  const project = test.info().project.name;
  const file = path.join(ART, `${project}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

test.describe("RedCup production flows", () => {
  test("marketing pages load without console errors", async ({ page }) => {
    const done = await noConsoleErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Fund a reel bounty/i })).toBeVisible();
    await shot(page, "home");
    await page.goto("/for-brands");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await shot(page, "for-brands");
    await page.goto("/for-creators");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await shot(page, "for-creators");
    await page.goto("/bounties");
    await expect(page.getByRole("heading", { name: /Open bounties/i })).toBeVisible();
    await shot(page, "bounties");
    await page.goto("/creators");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await shot(page, "creators");
    await page.goto("/about");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
    await shot(page, "login");
    done();
  });

  test("health reports neon", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBeTruthy();
    expect(body.db).toBe("neon");
  });


  test("cinematic role picker and both onboarding paths render", async ({ page }) => {
    const done = await noConsoleErrors(page);
    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /I'm a brand/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /I'm a creator/i })).toBeVisible();
    await page.getByRole("button", { name: "Brand", exact: true }).click();
    await expect(page).toHaveURL(/signup\?role=brand/);
    await expect(page.getByRole("button", { name: "Brand", exact: true })).toBeVisible();
    await page.goto("/signup?role=creator");
    await expect(page.getByRole("button", { name: "Creator", exact: true })).toBeVisible();
    await done();
  });

  test("full bounty lifecycle: signup → fund → apply → shortlist → award → draft → approve", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    const done = await noConsoleErrors(page);
    const id = stamp();
    const brandEmail = `brand.${id}@redcup.test`;
    const creatorEmail = `creator.${id}@redcup.test`;
    const password = "RedCupTest9!";
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "thenoteaditya@gmail.com";
    const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    test.skip(!adminPassword, "ADMIN_BOOTSTRAP_PASSWORD required");

    // Brand signup + onboarding
    await page.goto("/signup?role=brand");
    await page.getByRole("button", { name: "Brand", exact: true }).click();
    await page.getByLabel("Business name").fill(`Test Brand ${id}`);
    await page.getByLabel("Email", { exact: true }).fill(brandEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/brand\/onboarding/, { timeout: 30_000 });
    // Conversational brand onboarding — one field per screen
    await page.getByLabel("Business name").fill(`Test Brand ${id}`);
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("Category").fill("Beauty");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("City").fill("Mumbai");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("Website").fill("https://example.com");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("GSTIN (for KYC)").fill("27AABCU9603R1ZM");
    await page.getByRole("button", { name: /Save and continue/i }).click();
    await expect(page).toHaveURL(/\/brand/, { timeout: 30_000 });
    await shot(page, "brand-dashboard");

    // Admin approves KYC
    await signIn(page, adminEmail, adminPassword!, /\/admin/);
    await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
    await shot(page, "admin");
    await page.goto("/admin/verification");
    const brandCard = page.locator(".card", { hasText: `Test Brand ${id}` });
    if (!(await brandCard.count())) {
      await page.waitForTimeout(1500);
      await page.reload();
    }
    await expect(brandCard.first()).toBeVisible({ timeout: 30_000 });
    await brandCard.first().getByRole("button", { name: /Approve KYC/i }).click();
    await page.waitForTimeout(800);
    await shot(page, "admin-verification");

    // Brand funds bounty (TEST MODE)
    await signIn(page, brandEmail, password, /\/brand/);
    await page.goto("/brand/bounties/new");
    await expect(page.getByText(/TEST MODE/i).first()).toBeVisible();
    await shot(page, "bounty-builder-test-mode");
    await page.getByLabel("Title").fill(`E2E bounty ${id}`);
    await page.getByLabel("Criteria preset").selectOption({ label: "Open India (1K+)" });
    await page.getByLabel("Brief").fill("Show a 20s morning routine with natural light.");
    await page.getByLabel("Do / don't").fill("Do: paid partnership.\nDon't: competitors.");
    await page.getByRole("button", { name: /Create and fund/i }).click();
    await expect(page).toHaveURL(/\/brand\/bounties\//, { timeout: 45_000 });
    await expect(page.getByText(/E2E bounty/i).first()).toBeVisible();
    await shot(page, "brand-campaign-live");
    const campaignUrl = page.url();

    // Creator signup + onboarding + apply
    await page.goto("/signup?role=creator");
    await page.getByRole("button", { name: "Creator", exact: true }).click();
    await page.getByLabel(/Display name/i).fill(`Creator ${id}`);
    await page.getByLabel("Email", { exact: true }).fill(creatorEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/creator\/onboarding/, { timeout: 30_000 });
    // Conversational creator onboarding — one field per screen
    await page.getByLabel("Display name").fill(`Creator ${id}`);
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("Instagram handle").fill(`creator${id}`);
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("City").fill("Mumbai");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel(/Languages/i).fill("Hindi, English");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel(/Categories/i).fill("Beauty, Lifestyle");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel(/WhatsApp/i).fill("+919876543210");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("PAN").fill("ABCDE1234F");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("UPI ID").fill(`creator${id}@upi`);
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel(/Followers/i).fill("15000");
    await page.getByRole("button", { name: /Save and continue/i }).click();
    await expect(page).toHaveURL(/\/creator/, { timeout: 30_000 });
    await shot(page, "creator-dashboard");
    const bountyCard = page.locator(".card", { hasText: `E2E bounty ${id}` });
    await expect(bountyCard.first()).toBeVisible({ timeout: 20_000 });
    await bountyCard.first().getByRole("button", { name: /^Apply$/i }).click();
    await expect(bountyCard.first().getByText(/Applied/i)).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-applied");

    // Brand shortlist + award
    await signIn(page, brandEmail, password, /\/brand/);
    await page.goto(campaignUrl);
    await expect(page).toHaveURL(/\/brand\/bounties\//, { timeout: 20_000 });
    await expect(page.getByRole("button", { name: /Generate shortlist/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /Generate shortlist/i }).click();
    await expect(page.getByText(/SHORTLISTED|Award up to/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, "brand-shortlist");
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: /Award selected/i }).click();
    await expect(page.getByText(/AWARDED|in_production/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, "brand-awarded");

    // Creator draft
    await signIn(page, creatorEmail, password, /\/creator/);
    await page.goto("/creator/applications");
    await expect(page.getByRole("heading", { name: /Applications/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("link", { name: new RegExp(`E2E bounty ${id}`) }).click();
    await expect(page.getByLabel("Caption")).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Caption").fill("Morning glow with vitamin C — Paid partnership.");
    await page.getByLabel(/Video path/i).fill("uploads/e2e-draft.mp4");
    await page.getByRole("button", { name: /Send draft/i }).click();
    await expect(page.getByText(/DRAFT_SENT|pending|Draft v/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-draft");

    // Brand approve draft
    await signIn(page, brandEmail, password, /\/brand/);
    await page.goto(campaignUrl);
    await page.getByRole("button", { name: /^Approve$/i }).click();
    await expect(page.getByText(/approved|APPROVED/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "brand-draft-approved");

    // Creator posts reel
    await signIn(page, creatorEmail, password, /\/creator/);
    await page.goto("/creator/applications");
    await expect(page.getByRole("heading", { name: /Applications/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("link", { name: new RegExp(`E2E bounty ${id}`) }).click();
    await expect(page.getByLabel(/Instagram permalink/i)).toBeVisible({ timeout: 20_000 });
    await page.getByLabel(/Instagram permalink/i).fill("https://www.instagram.com/reel/E2ETEST123/");
    await page.getByRole("button", { name: /Mark as posted/i }).click();
    await expect(page.getByText(/POSTED|posted/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-posted");

    done();
  });
});
