import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1920, height: 1080 },
    video: "on-first-retry",
    screenshot: "only-on-failure",
  },
  testMatch: "playwright/tests/**/*.spec.ts",
  retries: 0,
  workers: 1, // Disable parallelism - run tests serially like Cypress
  reporter: [
    ["list"],
    [
      "junit",
      {
        outputFile: "bin/playwright/junit.xml",
        suiteName: "Spruce E2E Tests",
      },
    ],
  ],
  globalSetup: "./playwright/global-setup.ts",
  globalTeardown: "./playwright/global-teardown.ts",
});
