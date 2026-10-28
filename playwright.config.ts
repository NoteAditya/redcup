import { defineConfig, devices } from "@playwright/test";
import fs from "fs";
import path from "path";

const artifactEnv = path.join("/workspace/om-app/artifacts/.admin-bootstrap.env");
if (fs.existsSync(artifactEnv)) {
  for (const line of fs.readFileSync(artifactEnv, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "https://redcup-notes-projects-01308c80.vercel.app";
const isRemote = /^https?:\/\//.test(baseURL) && !baseURL.includes("127.0.0.1") && !baseURL.includes("localhost");

export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "/workspace/om-app/artifacts/playwright-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    browserName: "chromium",
    channel: "chrome",
  },
  webServer: isRemote
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: "mobile-390",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
