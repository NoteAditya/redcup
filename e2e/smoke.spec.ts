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

  test("full bounty lifecycle: signup → fund → apply → shortlist → award → draft → approve", async ({
    page,
  }) => {
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
    await page.getByLabel("Business name").fill(`Test Brand ${id}`);
    await page.getByLabel("Category").fill("Beauty");
    await page.getByLabel("City").fill("Mumbai");
    await page.getByLabel("Website").fill("https://example.com");
    await page.getByLabel("GSTIN (for KYC)").fill("27AABCU9603R1ZM");
    await page.getByRole("button", { name: /Save and continue/i }).click();
    await expect(page).toHaveURL(/\/brand/, { timeout: 30_000 });
    await shot(page, "brand-dashboard");

    // Admin approves KYC
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(adminEmail);
    await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
    await shot(page, "admin");
    await page.goto("/admin/verification");
    await expect(page.getByText(`Test Brand ${id}`).first()).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /Approve KYC/i }).first().click();
    await page.waitForTimeout(800);
    await shot(page, "admin-verification");

    // Brand funds bounty (TEST MODE)
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(brandEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await expect(page).toHaveURL(/\/brand/, { timeout: 30_000 });
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
    await page.getByLabel("Display name").fill(`Creator ${id}`);
    await page.getByLabel("Instagram handle").fill(`creator${id}`);
    await page.getByLabel("City").fill("Mumbai");
    await page.getByLabel(/Languages/i).fill("Hindi, English");
    await page.getByLabel(/Categories/i).fill("Beauty, Lifestyle");
    await page.getByLabel(/WhatsApp/i).fill("+919876543210");
    await page.getByLabel("PAN").fill("ABCDE1234F");
    await page.getByLabel("UPI ID").fill(`creator${id}@upi`);
    await page.getByLabel(/Followers/i).fill("15000");
    await page.getByRole("button", { name: /Save and continue/i }).click();
    await expect(page).toHaveURL(/\/creator/, { timeout: 30_000 });
    await shot(page, "creator-dashboard");
    await expect(page.getByText(`E2E bounty ${id}`)).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /^Apply$/i }).first().click();
    await expect(page.getByText(/Applied/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-applied");

    // Brand shortlist + award
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(brandEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.goto(campaignUrl);
    await page.getByRole("button", { name: /Generate shortlist/i }).click();
    await expect(page.getByText(/SHORTLISTED|Award up to/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, "brand-shortlist");
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: /Award selected/i }).click();
    await expect(page.getByText(/AWARDED|in_production/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, "brand-awarded");

    // Creator draft
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(creatorEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.goto("/creator/applications");
    await page.getByRole("link").first().click();
    await page.getByLabel("Caption").fill("Morning glow with vitamin C — Paid partnership.");
    await page.getByLabel(/Video path/i).fill("uploads/e2e-draft.mp4");
    await page.getByRole("button", { name: /Send draft/i }).click();
    await expect(page.getByText(/DRAFT_SENT|pending|draft/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-draft");

    // Brand approve draft
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(brandEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.goto(campaignUrl);
    await page.getByRole("button", { name: /^Approve$/i }).click();
    await expect(page.getByText(/approved|APPROVED/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "brand-draft-approved");

    // Creator posts reel
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(creatorEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.goto("/creator/applications");
    await page.getByRole("link").first().click();
    await page.getByLabel(/Instagram permalink/i).fill("https://www.instagram.com/reel/E2ETEST123/");
    await page.getByRole("button", { name: /Mark as posted/i }).click();
    await expect(page.getByText(/POSTED|posted/i).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, "creator-posted");

    done();
  });
});
