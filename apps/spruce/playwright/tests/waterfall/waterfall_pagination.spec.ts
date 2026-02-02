import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

test.describe("Waterfall pagination", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/project/spruce/waterfall");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("url query params update as page changes", async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage.url()).not.toContain("maxOrder");
    await expect(getByDataCy(authenticatedPage, "version-labels")).toContainText(
      "2ab1c56",
    );

    await getByDataCy(authenticatedPage, "next-page-button").click();
    await expect(getByDataCy(authenticatedPage, "version-labels")).toContainText(
      "e391612",
    );
    await expect(authenticatedPage.url()).toContain("maxOrder");

    await getByDataCy(authenticatedPage, "prev-page-button").click();
    await expect(getByDataCy(authenticatedPage, "version-labels")).toContainText(
      "2ab1c56",
    );
    await expect(authenticatedPage.url()).not.toContain("maxOrder");
  });

  test("versions update correctly as page changes", async ({
    authenticatedPage,
  }) => {
    const firstPageFirstCommit = "2ab1c56";
    const secondPageFirstCommit = "e391612";

    const versionLabels = getByDataCy(authenticatedPage, "version-labels");
    await expect(versionLabels.locator("> *")).toHaveCount(6);
    await expect(versionLabels.locator("> *").first()).toContainText(
      firstPageFirstCommit,
    );

    await getByDataCy(authenticatedPage, "next-page-button").click();
    await expect(versionLabels.locator("> *")).toHaveCount(5);
    await expect(versionLabels.locator("> *").first()).toContainText(
      secondPageFirstCommit,
    );

    await getByDataCy(authenticatedPage, "prev-page-button").click();
    await expect(versionLabels.locator("> *")).toHaveCount(6);
    await expect(versionLabels.locator("> *").first()).toContainText(
      firstPageFirstCommit,
    );
  });

  test("correctly disables buttons on first and last page", async ({
    authenticatedPage,
  }) => {
    await expect(
      getByDataCy(authenticatedPage, "prev-page-button"),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "next-page-button"),
    ).toHaveAttribute("aria-disabled", "false");

    await getByDataCy(authenticatedPage, "next-page-button").click();
    await getByDataCy(authenticatedPage, "next-page-button").click();
    await getByDataCy(authenticatedPage, "next-page-button").click();
    await expect(
      getByDataCy(authenticatedPage, "next-page-button"),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "prev-page-button"),
    ).toHaveAttribute("aria-disabled", "false");

    await getByDataCy(authenticatedPage, "prev-page-button").click();
    await getByDataCy(authenticatedPage, "prev-page-button").click();
    await getByDataCy(authenticatedPage, "prev-page-button").click();
    await expect(
      getByDataCy(authenticatedPage, "prev-page-button"),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("'Jump to most recent commit' button returns user to the first page", async ({
    authenticatedPage,
  }) => {
    const firstPageFirstCommit = "2ab1c56";
    const versionLabels = getByDataCy(authenticatedPage, "version-labels");

    await expect(versionLabels.locator("> *")).toHaveCount(6);
    await expect(versionLabels.locator("> *").first()).toContainText(
      firstPageFirstCommit,
    );

    await getByDataCy(authenticatedPage, "next-page-button").click();
    await expect(versionLabels.locator("> *")).toHaveCount(5);
    await expect(authenticatedPage.url()).toContain("maxOrder");
    await getByDataCy(authenticatedPage, "next-page-button").click();
    await expect(authenticatedPage.url()).toContain("maxOrder");

    await getByDataCy(authenticatedPage, "waterfall-menu").click();
    await getByDataCy(authenticatedPage, "jump-to-most-recent").click();
    await expect(versionLabels.locator("> *").first()).toContainText(
      firstPageFirstCommit,
    );
    await expect(authenticatedPage.url()).not.toContain("maxOrder");
    await expect(authenticatedPage.url()).not.toContain("minOrder");
  });
});
