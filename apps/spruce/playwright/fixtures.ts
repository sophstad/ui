import { test as base, Page, Route } from "@playwright/test";
import { execSync } from "child_process";
import * as helpers from "./helpers";
import { isMutation, hasOperationName } from "./helpers/graphql";

type CustomFixtures = {
  authenticatedPage: Page;
};

const hostMutations = ["ReprovisionToNew", "RestartJasper", "UpdateHostStatus"];

export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Set up mutation detection BEFORE login/navigation
    let mutationDispatched = false;
    let clearAmboyDB = false;

    // Intercept GraphQL queries to detect mutations
    // Match both relative and absolute paths
    const handleRoute = async (route: Route) => {
      try {
        if (isMutation(route)) {
          mutationDispatched = true;
          for (const mutation of hostMutations) {
            if (hasOperationName(route, mutation)) {
              clearAmboyDB = true;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore errors in mutation detection
      }
      await route.continue();
    };

    await page.route("**/graphql/query", handleRoute);
    // Also match the relative path pattern used by Cypress
    await page.route("/graphql/query", handleRoute);

    // Login
    await helpers.login(page);

    // Set cookies
    const bannerCookie = "This is an important notification";
    await context.addCookies([
      {
        name: bannerCookie,
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "has-closed-slack-banner",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "seen-waterfall-onboarding-tutorial",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "seen-task-history-onboarding-tutorial",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "seen-task-review-tooltip",
        value: "true",
        domain: "localhost",
        path: "/",
      },
      {
        name: "seen-test-selection-guide-cue",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);

    // Cleanup: restore and reseed database if mutation was dispatched
    if (mutationDispatched) {
      if (clearAmboyDB) {
        try {
          console.log(
            "A mutation that creates an Amboy job was detected. Restoring Amboy.",
          );
          execSync("pnpm evg-db-ops --restore amboy");
        } catch (e) {
          console.error("Failed to restore amboy database:", e);
        }
      }
      try {
        console.log("A mutation was detected. Restoring Evergreen.");
        execSync("pnpm evg-db-ops --restore evergreen");
        // Reseed after restore to ensure fresh test data for next test
        execSync("pnpm evg-db-ops --reseed-and-dump");
      } catch (e) {
        console.error("Failed to restore/reseed evergreen database:", e);
      }
    }
  },
});

export { expect } from "@playwright/test";
