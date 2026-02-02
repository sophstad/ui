import { test, expect } from "../../fixtures";
import { getByDataCy, getByDataTestId, getInputByLabel } from "../../helpers";

test.describe("Waterfall filters", () => {
  test.describe("status filtering", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/spruce/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("filters on failed tasks and fetches additional from the server", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "inactive-versions-button").first(),
      ).toContainText("1");
      await getByDataCy(authenticatedPage, "status-filter").click();
      await getByDataCy(authenticatedPage, "failed-option").click();
      await expect(
        authenticatedPage.locator("a[data-tooltip]"),
      ).toHaveCount(4);
      await expect(
        getByDataCy(authenticatedPage, "version-label-active"),
      ).toHaveCount(4);
      await expect(
        getByDataCy(authenticatedPage, "inactive-versions-button"),
      ).toHaveCount(3);
    });
  });

  test.describe("requester filtering", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/spruce/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("filters on periodic builds and shows an empty state", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "inactive-versions-button").first(),
      ).toContainText("1");
      await getByDataCy(authenticatedPage, "requester-filter").click();
      await getByDataCy(authenticatedPage, "ad_hoc-option").click();
      await expect(
        authenticatedPage.getByText("No Results Found"),
      ).toBeVisible();
    });

    test("clears requester filters", async ({ authenticatedPage }) => {
      await getByDataCy(authenticatedPage, "requester-filter").click();
      await getByDataCy(authenticatedPage, "gitter_request-option").click();
      await expect(
        getByDataCy(authenticatedPage, "version-label-active"),
      ).toHaveCount(3);

      await getByDataCy(authenticatedPage, "requester-filter")
        .locator("button[aria-label='Clear selection']")
        .click();
      await expect(
        getByDataCy(authenticatedPage, "version-label-active"),
      ).toHaveCount(5);
    });
  });

  test.describe("build variant filtering", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/evergreen/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("submitting a build variant filter updates the url, creates a badge and filters the grid", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(2);
      await getByDataCy(authenticatedPage, "build-variant-filter-input").type(
        "P{Enter}",
      );
      await expect(
        getByDataCy(authenticatedPage, "filter-chip").first(),
      ).toHaveText("Variant: P");
      await expect(authenticatedPage.url()).toContain("buildVariants=P");
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(0);

      await getByDataTestId(authenticatedPage, "chip-dismiss-button")
        .first()
        .click();
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(2);

      await getByDataCy(authenticatedPage, "build-variant-filter-input").type(
        "Ubuntu{Enter}",
      );
      await expect(authenticatedPage.url()).toContain("buildVariants=Ubuntu");
      await expect(
        getByDataCy(authenticatedPage, "filter-chip").first(),
      ).toHaveText("Variant: Ubuntu");
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(1);
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveText("Ubuntu 16.04");
    });
  });

  test.describe("task filtering", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/evergreen/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("filters grid squares, removes inactive build variants, creates a badge, and updates the url", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(2);
      await getByDataCy(authenticatedPage, "task-filter-input").type(
        "agent{Enter}",
      );
      await expect(
        getByDataCy(authenticatedPage, "build-variant-label"),
      ).toHaveCount(1);
      await expect(authenticatedPage.url()).toContain("tasks=agent");
      await expect(
        getByDataCy(authenticatedPage, "filter-chip").first(),
      ).toHaveText("Task: agent");
      await expect(
        authenticatedPage.locator("a[data-tooltip]"),
      ).toHaveCount(1);
      await expect(
        authenticatedPage.locator("a[data-tooltip]").first(),
      ).toHaveAttribute(
        "data-tooltip",
        "test-agent - Succeeded",
      );
    });
  });

  test.describe("revision filtering", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/spruce/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("filters by git commit", async ({ authenticatedPage }) => {
      await getByDataCy(authenticatedPage, "waterfall-menu").click();
      await getByDataCy(authenticatedPage, "git-commit-search").click();
      await expect(
        getByDataCy(authenticatedPage, "git-commit-search-modal"),
      ).toBeVisible();
      const input = await getInputByLabel(authenticatedPage, "Git Commit Hash");
      await input.type("ab49443{Enter}");
      await expect(
        authenticatedPage.locator('[data-cy="git-commit-search-modal"]'),
      ).toHaveCount(0);
      await expect(
        getByDataCy(authenticatedPage, "version-label-active"),
      ).toContainText("ab49443");
    });

    test("should highlight a commit if it is passed into the url", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto("/project/spruce/waterfall?revision=ab49443");
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "version-label-active"),
      ).toContainText("ab49443");
      await expect(
        getByDataCy(authenticatedPage, "version-label-active").filter({
          hasText: "ab49443",
        }),
      ).toHaveAttribute("data-highlighted", "true");
    });
  });

  test.describe("project selection", () => {
    test("selects a project and applies current task filters", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto("/project/spruce/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
      await getByDataCy(authenticatedPage, "status-filter").click();
      await getByDataCy(authenticatedPage, "test-timed-out-option").click();
      await authenticatedPage.locator("body").click({ position: { x: 0, y: 0 } });
      await getByDataCy(authenticatedPage, "project-select").click();
      await getByDataCy(authenticatedPage, "project-select-options")
        .getByText("evergreen smoke test")
        .click();
      await expect(authenticatedPage).toHaveURL(
        "http://localhost:3000/project/evergreen/waterfall",
      );
      await expect(authenticatedPage.url()).toContain(
        "statuses=test-timed-out",
      );
    });
  });

  test.describe("clear all filters button", () => {
    test("clicking the clear filters button clears all parameters except for minOrder & maxOrder", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(
        "/project/spruce/waterfall?buildVariants=ubuntu&maxOrder=1235&requesters=gitter_request&statuses=success&tasks=test",
      );
      await authenticatedPage.waitForLoadState("networkidle");
      await getByDataCy(authenticatedPage, "waterfall-menu").click();
      await getByDataCy(authenticatedPage, "clear-all-filters").click();

      await expect(authenticatedPage.url()).not.toContain("buildVariants");
      await expect(authenticatedPage.url()).not.toContain("tasks=");
      await expect(authenticatedPage.url()).not.toContain("statuses=");
      await expect(authenticatedPage.url()).not.toContain("requesters=");
      await expect(authenticatedPage.url()).toContain("maxOrder=1235");
    });
  });
});
