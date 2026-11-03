import { test, expect } from "@playwright/test";

test.describe("Form validation UX", () => {
  test("signup shows inline errors and preserves input", async ({ page }) => {
    await page.goto("/signup?role=brand");
    await page.getByLabel("Business name").fill("Keep Me");
    await page.getByLabel("Email", { exact: true }).fill("not-an-email");
    await page.locator("#password").fill("short");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /valid email|Password needs/i }).first()).toBeVisible();
    await expect(page.getByLabel("Business name")).toHaveValue("Keep Me");
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue("not-an-email");
  });

  test("login requires contact and password with aria-invalid", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await expect(page.locator("#contact")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("brand onboarding validates empty step and keeps draft", async ({ page }) => {
    await page.goto("/signup?role=brand");
    const id = Date.now().toString(36);
    await page.getByLabel("Business name").fill(`Form Brand ${id}`);
    await page.getByLabel("Email", { exact: true }).fill(`form.brand.${id}@redcup.test`);
    await page.locator("#password").fill("RedCupTest9!");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/brand\/onboarding/, { timeout: 30_000 });
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await page.getByLabel("Business name").fill(`Form Brand ${id}`);
    await expect(page.getByLabel("Business name")).toHaveValue(`Form Brand ${id}`);
  });

  test("creator onboarding rejects bad handle with inline error", async ({ page }) => {
    const id = Date.now().toString(36);
    await page.goto("/signup?role=creator");
    await page.getByLabel(/Display name/i).fill(`Form Creator ${id}`);
    await page.getByLabel("Email", { exact: true }).fill(`form.creator.${id}@redcup.test`);
    await page.locator("#password").fill("RedCupTest9!");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/creator\/onboarding/, { timeout: 30_000 });
    await page.getByLabel("Display name").fill(`Form Creator ${id}`);
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await page.getByLabel("Instagram handle").fill("bad handle!!");
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByLabel("Instagram handle")).toHaveValue("bad handle!!");
  });
});
