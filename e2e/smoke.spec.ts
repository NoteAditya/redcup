import { test, expect } from "@playwright/test";

test.describe("RedCup smoke", () => {
  test("home and marketing pages load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Fund a reel bounty/i })).toBeVisible();
    await page.goto("/bounties");
    await expect(page.getByRole("heading", { name: /Open bounties/i })).toBeVisible();
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("creator can sign in and see eligibility", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email or phone").fill("ananya.beauty@demo.redcup");
    await page.getByLabel("Password", { exact: true }).fill("redcup123");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/creator/);
    await expect(page.getByRole("heading", { name: /Creator dashboard/i })).toBeVisible();
  });
});
