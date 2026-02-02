import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 800 },
    video: "on-first-retry",
    screenshot: "only-on-failure",
  },
  testMatch: "playwright/tests/**/*.spec.ts",
  retries: 3,
  workers: 1, // Disable parallelism - run tests serially like Cypress
  reporter: [
    ["list"],
    [
      "junit",
      {
        outputFile: "bin/playwright/junit.xml",
        suiteName: "Parsley E2E Tests",
      },
    ],
  ],
  globalSetup: "./playwright/global-setup.ts",
  globalTeardown: "./playwright/global-teardown.ts",
});
