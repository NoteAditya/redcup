import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

/**
 * Admin gate verification: brand approval → campaign approval → application review.
 * Creates throwaway accounts with emails `qa.*.<id>@redcup.test`; scripts/qa-cleanup.mjs removes them.
 */
const ART = "/workspace/om-app/artifacts/admin-gate";
fs.mkdirSync(ART, { recursive: true });
const id = process.env.QA_ID || `${Date.now().toString(36)}`;
fs.writeFileSync(path.join(ART, "last-qa-id.txt"), id);
const password = "RedCupQa9!x";
const brandEmail = `qa.brand.${id}@redcup.test`;
const creatorEmail = `qa.creator.${id}@redcup.test`;
const brandName = `QA Brand ${id}`;
const creatorName = `QA Creator ${id}`;
const title = `QA bounty ${id}`;

async function signIn(page: Page, contact: string, pw: string) {
  await page.context().clearCookies();
  if (contact === process.env.ADMIN_BOOTSTRAP_EMAIL) {
    // Admins have their own sign-in page at /admin.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.locator('input[name="email"]').fill(contact);
    await page.locator('input[name="password"]').fill(pw);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    return;
  }
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator("#contact").fill(contact);
  await page.locator("#password").fill(pw);
  await page.getByRole("button", { name: /^Sign in$/i }).click();
}

async function signInOk(page: Page, contact: string, pw: string, expectPath: RegExp) {
  await signIn(page, contact, pw);
  await page.waitForURL((u) => !u.pathname.startsWith("/login") && !u.pathname.startsWith("/admin/login"), { timeout: 30_000 });
  await expect(page).toHaveURL(expectPath, { timeout: 15_000 });
}

/** Creators log in with Instagram only; QA gets an equivalent session from scripts/qa-creator-session.mjs. */
let creatorCookie = "";
async function signInCreator(page: Page, expectDashboard = true) {
  if (!creatorCookie) {
    creatorCookie = execFileSync("node", ["scripts/qa-creator-session.mjs", id], { encoding: "utf8" }).trim();
  }
  await page.context().clearCookies();
  await page.goto("/privacy");
  const base = new URL(page.url());
  await page.context().addCookies([
    {
      name: "redcup_session",
      value: creatorCookie,
      domain: base.hostname,
      path: "/",
      httpOnly: true,
      secure: base.protocol === "https:",
      sameSite: "Lax",
    },
  ]);
  await page.goto("/creator");
  await page.waitForLoadState("networkidle");
  if (expectDashboard) await expect(page).toHaveURL(/\/creator/, { timeout: 30_000 });
}

const shot = (page: Page, name: string) => page.screenshot({ path: path.join(ART, `${name}.png`), fullPage: true });

test.describe.configure({ mode: "serial" });

test("admin gates brands, campaigns and applications", async ({ page }) => {
  test.setTimeout(900_000);
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL!;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD!;
  test.skip(!adminEmail || !adminPassword, "admin credentials required");

  // 1. Brand signs up and finishes profile → sees pending screen, can't reach bounty builder.
  await page.goto("/signup?role=brand");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Business name").fill(brandName);
  await page.getByLabel("Email", { exact: true }).fill(brandEmail);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /Create account/i }).click();
  await expect(page).toHaveURL(/\/brand\/onboarding/, { timeout: 30_000 });
  await page.getByLabel("Business name").fill(brandName);
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel("Category").selectOption("Beauty");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel("City").fill("Mumbai");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel("Website").fill("https://example.com");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  // Skip GST: onboarding finishes but the brand stays pending with "GST missing".
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page).toHaveURL(/\/brand$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Add your GST to get approved/i })).toBeVisible();
  await shot(page, "01-brand-pending-gst-missing");
  await page.goto("/brand/bounties/new");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /Add your GST/i })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveCount(0);

  // Profile opens as a normal editable page, not the wizard.
  await page.goto("/brand/onboarding");
  await expect(page).toHaveURL(/\/brand\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Edit profile" })).toBeVisible();
  await expect(page.getByLabel("Business name")).toHaveValue(brandName);
  await expect(page.getByLabel(/Category/)).toHaveValue("Beauty");

  // Admin queue: brand sits under "GST missing", approval is blocked without an override.
  await signInOk(page, process.env.ADMIN_BOOTSTRAP_EMAIL!, process.env.ADMIN_BOOTSTRAP_PASSWORD!, /\/admin/);
  await page.goto("/admin/verification?show=gst_missing");
  await page.waitForLoadState("networkidle");
  const missingPanel = page.locator(".adm-panel:visible", { hasText: brandName });
  await expect(missingPanel.getByText("GST missing").first()).toBeVisible({ timeout: 30_000 });
  await expect(missingPanel.getByRole("button", { name: /Approve without GST/i })).toBeDisabled();
  await shot(page, "01c-admin-gst-missing");

  // Brand adds GST from the profile → goes to the Submitted queue.
  await signInOk(page, brandEmail, password, /\/brand/);
  await page.goto("/brand/profile#gst");
  await page.getByLabel("GSTIN").fill("27AABCU9603R1ZM");
  await page.getByRole("button", { name: /Save and submit for approval/i }).click();
  await expect(page.getByText(/approval queue/i)).toBeVisible({ timeout: 30_000 });
  await page.goto("/brand");
  await expect(page.getByRole("heading", { name: /waiting for RedCup approval/i })).toBeVisible();
  await shot(page, "01-brand-pending");

  // 2. Creator signup offers Instagram only (no Google, no email/password).
  await page.context().clearCookies();
  await page.goto("/signup?role=creator");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("instagram-login")).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Google/i })).toHaveCount(0);
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await expect(page.locator("#password")).toHaveCount(0);
  await shot(page, "01b-creator-signup-instagram-only");

  // Creator (session as if from Instagram login) onboards immediately, no approval.
  await signInCreator(page);
  await page.goto("/creator/onboarding");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Display name").fill(creatorName);
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel("City").fill("Mumbai");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel(/Languages/i).fill("Hindi, English");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.locator("#categories summary").click();
  await page.getByRole("checkbox", { name: "Beauty" }).check();
  await page.getByRole("checkbox", { name: "Lifestyle" }).check();
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByLabel(/WhatsApp/i).fill("+919876543210");
  await page.getByRole("button", { name: /^Continue$/i }).click();
  // PAN can be skipped.
  await expect(page.getByRole("button", { name: /^Skip$/ })).toBeVisible();
  await page.getByRole("button", { name: /^Skip$/ }).click();
  await page.getByLabel("UPI ID").fill(`qa${id}@upi`);
  await page.getByRole("button", { name: /Save and continue/i }).click();
  await expect(page).toHaveURL(/\/creator$/, { timeout: 30_000 });
  // Profile opens as a normal page with Instagram data and the top-reels empty state (QA creator has no token).
  await page.goto("/creator/onboarding");
  await expect(page).toHaveURL(/\/creator\/profile/, { timeout: 30_000 });
  await expect(page.getByLabel("Display name")).toHaveValue(creatorName);
  await expect(page.getByText(/Instagram connection is missing or expired|after logging in with Instagram/i)).toBeVisible();
  await expect(page.getByText(/You skipped this/i)).toBeVisible();
  await shot(page, "01d-creator-profile");

  // 3. Admin approves the brand from Brand approvals.
  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto("/admin/verification");
  await page.waitForLoadState("networkidle");
  const brandPanel = page.locator(".adm-panel:visible", { hasText: brandName });
  await expect(brandPanel).toBeVisible({ timeout: 30_000 });
  // Reject without a reason must fail
  await brandPanel.getByRole("button", { name: /^Reject$/ }).click();
  await expect(brandPanel.getByText(/Type a reason/i)).toBeVisible();
  await brandPanel.getByLabel(/Reason/).fill("QA: GSTIN checked");
  await brandPanel.getByRole("button", { name: /Approve brand/i }).click();
  await expect(page.locator(".adm-panel:visible", { hasText: brandName })).toHaveCount(0, { timeout: 30_000 });
  await shot(page, "02-admin-brand-approved");

  // 4. Brand creates + funds a bounty → pending approval, not visible to creators.
  await signInOk(page, brandEmail, password, /\/brand/);
  await page.goto("/brand/bounties/new");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Criteria preset").selectOption({ label: "Open India (1K+)" });
  await page.getByLabel("Brief").fill("QA run: 20s morning routine reel.");
  await page.getByRole("button", { name: /Create and fund/i }).click();
  await expect(page).toHaveURL(/\/brand\/bounties\/cmp_/, { timeout: 45_000 });
  await expect(page.getByText("Waiting for RedCup approval")).toBeVisible({ timeout: 20_000 });
  const campaignUrl = page.url();
  const campaignId = campaignUrl.split("/").pop()!;
  await shot(page, "03-brand-campaign-pending");

  await page.context().clearCookies();
  await page.goto("/bounties");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(title)).toHaveCount(0);
  await signInCreator(page);
  await expect(page.locator(".card:visible", { hasText: title })).toHaveCount(0);

  // 5. Admin approves the campaign.
  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto("/admin/campaign-approvals");
  await page.waitForLoadState("networkidle");
  const campPanel = page.locator(".adm-panel:visible", { hasText: title });
  await expect(campPanel).toBeVisible({ timeout: 30_000 });
  await campPanel.getByRole("button", { name: /^Approve$/ }).click();
  await expect(page.locator(".adm-panel:visible", { hasText: title })).toHaveCount(0, { timeout: 30_000 });

  // 6. Creator now sees it and applies → pending review.
  await signInCreator(page);
  const card = page.locator(".card:visible", { hasText: title });
  await expect(card.first()).toBeVisible({ timeout: 45_000 });
  await card.first().getByRole("button", { name: /^Apply$/i }).click();
  await expect(card.first().getByText(/Applied/i)).toBeVisible({ timeout: 20_000 });
  await page.goto("/creator/applications");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Under RedCup review").first()).toBeVisible();
  await shot(page, "04-creator-under-review");

  // 7. Brand can't see the application yet.
  await signInOk(page, brandEmail, password, /\/brand/);
  await page.goto(campaignUrl);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/Creators appear here once RedCup approves them/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Applications (0)" })).toBeVisible();
  await expect(page.getByText(creatorName)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Generate shortlist/i })).toHaveCount(0);
  await shot(page, "05-brand-no-applicants");

  // 8. Admin approves the application from the queue (bulk path with filter).
  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto(`/admin/applications?campaign=${campaignId}`);
  await page.waitForLoadState("networkidle");
  const row = page.locator("tr:visible", { hasText: creatorName });
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.getByRole("checkbox").check();
  await page.getByPlaceholder(/Optional note/).filter({ visible: true }).fill("QA: good fit");
  await page.getByRole("button", { name: /Approve selected \(1\)/ }).click();
  await expect(page.locator("tr:visible", { hasText: creatorName })).toHaveCount(0, { timeout: 30_000 });
  await shot(page, "06-admin-app-approved");

  // 9. Brand now sees the creator.
  await signInOk(page, brandEmail, password, /\/brand/);
  await page.goto(campaignUrl);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Applications (1)" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(creatorName).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Generate shortlist/i })).toBeVisible();
  await shot(page, "07-brand-sees-creator");

  // 10. Admin pages load; activity log has our actions; user toggle blocks login.
  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  for (const p of [
    "/admin",
    "/admin/campaigns",
    "/admin/campaigns/new",
    `/admin/bounties/${campaignId}`,
    "/admin/applications",
    "/admin/campaign-approvals",
    "/admin/verification",
    "/admin/users",
    "/admin/activity",
    "/admin/metrics",
    "/admin/payouts",
  ]) {
    const res = await page.goto(p);
    await page.waitForLoadState("networkidle");
    expect(res?.status(), p).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  await page.goto(`/admin/bounties/${campaignId}`);
  await page.waitForLoadState("networkidle");
  await shot(page, "08-admin-campaign-detail");
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");
  await shot(page, "09-admin-overview");
  await page.goto(`/admin/activity?q=${encodeURIComponent(id)}`);
  await page.waitForLoadState("networkidle");
  for (const a of ["brand approve", "campaign approve", "application approve"]) {
    await expect(page.locator("td .chip", { hasText: a }).first()).toBeVisible();
  }
  await shot(page, "10-admin-activity");

  await page.goto(`/admin/users?q=${encodeURIComponent(creatorEmail)}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: creatorName }).click();
  await expect(page).toHaveURL(/\/admin\/users\/usr_/);
  await page.getByLabel(/Reason \(required/).fill("QA: deactivation test");
  await page.getByRole("button", { name: /Turn account off/ }).click();
  await expect(page.getByRole("button", { name: /Turn account back on/ })).toBeVisible({ timeout: 20_000 });
  await shot(page, "11-admin-user-off");
  await signInCreator(page, false);
  await expect(page.getByText(/account has been turned off/i)).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/login/);
});

test("admin edits, status changes, create-for-brand, send back and reject", async ({ page }) => {
  test.setTimeout(900_000);
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL!;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD!;
  test.skip(!adminEmail || !adminPassword, "admin credentials required");
  const adminTitle = `QA admin bounty ${id}`;
  const backTitle = `QA sendback ${id}`;

  // Admin creates a campaign for the QA brand.
  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto("/admin/campaigns/new");
  await page.waitForLoadState("networkidle");
  const brandOpt = page.locator("select option", { hasText: brandName });
  const brandValue = await brandOpt.getAttribute("value");
  await page.getByLabel("Brand").selectOption(brandValue!);
  await page.getByLabel("Title").fill(adminTitle);
  await page.getByLabel("Brief").fill("QA: admin-created bounty.");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/admin\/bounties\/cmp_/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: adminTitle })).toBeVisible();

  // Edit + pause/resume on the first QA bounty.
  await page.goto(`/admin/campaigns?q=${encodeURIComponent(title)}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/bounties\//);
  await page.getByLabel("Creator slots").fill("4");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Put live" })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Put live" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible({ timeout: 20_000 });

  // Brand funds the admin-created bounty → live immediately (pre-approved).
  await signInOk(page, brandEmail, password, /\/brand/);
  await page.locator(".bounty-card", { hasText: adminTitle }).click();
  await expect(page.getByText("Not funded yet")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Fund bounty" }).click();
  await expect(page.getByText(/^live ·/)).toBeVisible({ timeout: 30_000 });

  // Brand creates another bounty → admin sends it back → brand resubmits → admin rejects.
  await page.goto("/brand/bounties/new");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Title").fill(backTitle);
  await page.getByLabel("Brief").fill("QA: send back flow.");
  await page.getByRole("button", { name: /Create and fund/i }).click();
  await expect(page).toHaveURL(/\/brand\/bounties\/cmp_/, { timeout: 45_000 });
  const backUrl = page.url();

  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto("/admin/campaign-approvals");
  await page.waitForLoadState("networkidle");
  let panel = page.locator(".adm-panel:visible", { hasText: backTitle });
  await panel.getByRole("button", { name: /Send back/ }).click();
  await expect(panel.getByText(/Type a note/)).toBeVisible();
  await panel.getByLabel(/Note to the brand/).fill("QA: please add a CTA");
  await panel.getByRole("button", { name: /Send back/ }).click();
  await expect(page.locator(".adm-panel:visible", { hasText: backTitle })).toHaveCount(0, { timeout: 20_000 });

  await signInOk(page, brandEmail, password, /\/brand/);
  await page.goto(backUrl);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("RedCup asked for changes")).toBeVisible();
  await expect(page.getByText(/QA: please add a CTA/)).toBeVisible();
  await page.getByLabel("Brief").fill("QA: send back flow. CTA: link in bio.");
  await page.getByRole("button", { name: "Resubmit for review" }).click();
  await expect(page.getByText("Waiting for RedCup approval")).toBeVisible({ timeout: 20_000 });
  await shot(page, "12-brand-resubmitted");

  await signInOk(page, adminEmail, adminPassword, /\/admin/);
  await page.goto("/admin/campaign-approvals");
  await page.waitForLoadState("networkidle");
  panel = page.locator(".adm-panel:visible", { hasText: backTitle });
  await expect(panel).toBeVisible();
  await panel.getByLabel(/Note to the brand/).fill("QA: rejecting for test");
  await panel.getByRole("button", { name: /^Reject$/ }).click();
  await expect(page.locator(".adm-panel:visible", { hasText: backTitle })).toHaveCount(0, { timeout: 20_000 });

  await page.goto(`/admin/activity?q=${encodeURIComponent(id)}`);
  await page.waitForLoadState("networkidle");
  for (const a of ["campaign create", "campaign edit", "campaign status", "campaign send back", "campaign reject", "user deactivate"]) {
    await expect(page.locator("td .chip", { hasText: a }).first()).toBeVisible();
  }
  await page.goto("/admin/campaigns");
  await page.waitForLoadState("networkidle");
  await shot(page, "13-admin-campaigns");
  await page.goto("/admin/users");
  await page.waitForLoadState("networkidle");
  await shot(page, "14-admin-users");
});
