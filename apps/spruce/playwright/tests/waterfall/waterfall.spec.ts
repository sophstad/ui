import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

test.describe("Waterfall page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/project/spruce/waterfall");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test.describe("version labels", () => {
    test("shows a git tag label", async ({ authenticatedPage }) => {
      await expect(
        getByDataCy(authenticatedPage, "version-labels").locator("> *").nth(4),
      ).toContainText("Git Tags: v2.28.5");
    });
  });

  test.describe("inactive commits", () => {
    test("renders an inactive version column, button and broken versions badge", async ({
      authenticatedPage,
    }) => {
      const versionLabels = getByDataCy(authenticatedPage, "version-labels");
      await expect(
        versionLabels.locator("> *").nth(2).locator("button"),
      ).toHaveAttribute("data-cy", "inactive-versions-button");
      await expect(
        getByDataCy(authenticatedPage, "broken-versions-badge"),
      ).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "broken-versions-badge"),
      ).toContainText("1 broken");
      await expect(
        getByDataCy(authenticatedPage, "build-group")
          .first()
          .locator("> *")
          .nth(2),
      ).toHaveAttribute("data-cy", "inactive-column");
    });

    test("clicking an inactive versions button renders a inactive versions modal", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(authenticatedPage, "inactive-versions-button")
        .first()
        .click();
      const modal = getByDataCy(authenticatedPage, "inactive-versions-modal");
      await expect(modal).toBeVisible();
      await expect(modal).toContainText("Broken");
      await expect(modal).toContainText("1 Inactive Version");
      await expect(modal).toContainText("e695f65");
      await expect(modal).toContainText("Mar 2, 2022");
      await expect(modal).toContainText(
        "EVG-16356 Use Build Variant stats to fetch grouped build variants (#1106)",
      );
    });
  });

  test.describe("task grid", () => {
    test("correctly renders child tasks", async ({
      authenticatedPage,
    }) => {
      const buildGroups = getByDataCy(authenticatedPage, "build-group");
      await expect(buildGroups.nth(0).locator("> *")).toHaveCount(1);
      await expect(buildGroups.nth(1).locator("> *")).toHaveCount(8);
      await expect(buildGroups.nth(2).locator("> *")).toHaveCount(0);
      await expect(buildGroups.nth(3).locator("> *")).toHaveCount(1);
      await expect(buildGroups.nth(4).locator("> *")).toHaveCount(8);
      await expect(buildGroups.nth(5).locator("> *")).toHaveCount(8);
    });
  });

  test.describe("task stats tooltip", () => {
    test("shows task stats when clicked", async ({
      authenticatedPage,
    }) => {
      await expect(
        authenticatedPage.locator('[data-cy="task-stats-tooltip"]'),
      ).toHaveCount(0);
      await expect(
        getByDataCy(authenticatedPage, "task-stats-tooltip-button").nth(3),
      ).toHaveAttribute("aria-disabled", "false");
      await getByDataCy(authenticatedPage, "task-stats-tooltip-button")
        .nth(3)
        .click();
      await expect(
        getByDataCy(authenticatedPage, "task-stats-tooltip"),
      ).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "task-stats-tooltip"),
      ).toContainText("Failed");
      await expect(
        getByDataCy(authenticatedPage, "task-stats-tooltip"),
      ).toContainText("Succeeded");
    });
  });

  test.describe("pinned build variants", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/project/evergreen/waterfall");
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("clicking the pin button moves the build variant to the top, persist on reload, and unpin on click", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "build-variant-link").first(),
      ).toHaveText("Lint");
      await getByDataCy(authenticatedPage, "pin-button").nth(1).click();
      await expect(
        getByDataCy(authenticatedPage, "build-variant-link").first(),
      ).toHaveText("Ubuntu 16.04");
      await authenticatedPage.reload();
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "build-variant-link").first(),
      ).toHaveText("Ubuntu 16.04");
      await getByDataCy(authenticatedPage, "pin-button").nth(1).click();
      await expect(
        getByDataCy(authenticatedPage, "build-variant-link").first(),
      ).toHaveText("Lint");
    });
  });
});
