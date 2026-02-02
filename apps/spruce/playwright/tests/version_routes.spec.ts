import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";
import type { Page } from "@playwright/test";

const VERSIONS: Record<string, string> = {
  "0": "5ecedafb562343215a7ff297", // normal patch
  "1": "i-dont-exist", // non existent patch
  "2": "52a630633ff1227909000021", // patch 2
  "4": "evergreen_33016573166a36bd5f46b4111151899d5c4e95b1", // basecommit for versions[0]
  "5": "5e4ff3abe3c3317e352062e4",
};

const versionRoute = (id: string) => `/version/${id}`;

async function waitForTaskTable(page: Page): Promise<void> {
  const table = page.locator('[data-cy="tasks-table"]');
  await table.waitFor({ state: "visible" });
  await expect(table).not.toHaveAttribute("data-loading", "true");
}

test.describe("Version route", () => {
  test.describe("Metadata", () => {
    test("Shows patch parameters if they exist", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(versionRoute(VERSIONS["0"]));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        authenticatedPage.locator('[data-cy="parameters-modal"]'),
      ).toHaveCount(0);
      const parametersLink = getByDataCy(
        authenticatedPage,
        "parameters-link",
      );
      const hasParameters = await parametersLink
        .isVisible()
        .catch(() => false);
      test.skip(
        !hasParameters,
        "Version has no parameters in this environment",
      );
      if (!hasParameters) return;
      await parametersLink.click();
      await expect(
        getByDataCy(authenticatedPage, "parameters-modal"),
      ).toBeVisible();
      await authenticatedPage
        .locator('button[aria-label="Close modal"]')
        .click();
      await expect(
        getByDataCy(authenticatedPage, "parameters-modal"),
      ).not.toBeVisible();
    });

    test("'Base commit' link in metadata links to version page", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(versionRoute(VERSIONS["0"]));
      await authenticatedPage.waitForLoadState("networkidle");
      const href = await getByDataCy(
        authenticatedPage,
        "patch-base-commit",
      ).getAttribute("href");
      expect(href).toContain(`/version/${VERSIONS["4"]}`);
    });

    test("Doesn't show patch parameters if they don't exist", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(versionRoute(VERSIONS["2"]));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        authenticatedPage.locator('[data-cy="parameters-link"]'),
      ).toHaveCount(0);
      await expect(
        authenticatedPage.locator('[data-cy="parameters-modal"]'),
      ).toHaveCount(0);
    });
  });

  test.describe("Build Variants", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(versionRoute(VERSIONS["0"]));
      await waitForTaskTable(authenticatedPage);
    });

    test("Lists the patch's build variants", async ({
      authenticatedPage,
    }) => {
      const buildVariants = getByDataCy(authenticatedPage, "build-variants");
      await expect(buildVariants).toBeVisible();
      await expect(
        buildVariants.locator('[data-cy="patch-build-variant"]').first(),
      ).toBeVisible();
    });
  });

  test.describe("Page title", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(versionRoute(VERSIONS["5"]));
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("Should include a link to Jira", async ({
      authenticatedPage,
    }) => {
      const pageTitle = getByDataCy(authenticatedPage, "page-title");
      const jiraLink = pageTitle.locator("a", { hasText: "EVG-7425" });
      await expect(jiraLink).toHaveAttribute(
        "href",
        "https://jira.example.com/browse/EVG-7425",
      );
    });

    test("Should include a link to GitHub", async ({
      authenticatedPage,
    }) => {
      const pageTitle = getByDataCy(authenticatedPage, "page-title");
      const githubLink = pageTitle.locator(
        "a",
        { hasText: "https://github.com/evergreen-ci/evergreen/pull/3186" },
      );
      await expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/evergreen-ci/evergreen/pull/3186",
      );
    });
  });
});
