import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "reports/playwright-results.json" }]],
  use: {
    baseURL: "http://localhost:3030",
    channel: "chrome",
    headless: true,
    screenshot: "only-on-failure",
    trace: "off",
  },
});
