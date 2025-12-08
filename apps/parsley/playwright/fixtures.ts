import { test as base, Page } from "@playwright/test";
import { execSync } from "child_process";
import * as helpers from "./helpers";

type CustomFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Set up mutation detection BEFORE login/navigation
    let mutationDispatched = false;

    // Intercept GraphQL queries to detect mutations
    // Match both relative and absolute paths
    await page.route("**/graphql/query", async (route) => {
      const request = route.request();
      try {
        const postData = request.postDataJSON();
        if (postData?.query?.startsWith("mutation")) {
          mutationDispatched = true;
        }
      } catch (e) {
        // Ignore JSON parsing errors - continue the request
      }
      await route.continue();
    });

    // Also match the relative path pattern used by Cypress
    await page.route("/graphql/query", async (route) => {
      const request = route.request();
      try {
        const postData = request.postDataJSON();
        if (postData?.query?.startsWith("mutation")) {
          mutationDispatched = true;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      await route.continue();
    });

    // Login (like Cypress beforeEach does for all tests)
    await helpers.login(page);

    // Set cookies (like Cypress beforeEach)
    await context.addCookies([
      {
        name: "drawer-opened",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "has-seen-searchbar-guide-cue-tab-complete",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "has-seen-sections-prod-feature-modal",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);

    // Cleanup: restore and reseed database if mutation was dispatched (like Cypress afterEach)
    if (mutationDispatched) {
      try {
        console.log("A mutation was detected. Restoring Evergreen.");
        execSync("yarn evg-db-ops --restore evergreen");
        // Reseed after restore to ensure fresh test data for next test
        execSync("yarn evg-db-ops --reseed-and-dump");
      } catch (e) {
        console.error("Failed to restore/reseed evergreen database:", e);
      }
    }
  },
});

export { expect } from "@playwright/test";
