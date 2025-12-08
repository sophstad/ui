import { test, expect } from "../../fixtures";
import {
  getByDataCy,
  addSearch,
  editBounds,
  clearBounds,
  clickToggle,
  toggleDrawer,
  addFilter,
} from "../../helpers";

test.describe("Searching", () => {
  const logLink =
    "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(logLink);
  });

  test("searching for a term should highlight matching words", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "Starting");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText("Starting");
  });

  test("searching for a term should snap the matching line to the top of the window", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "info");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
    await expect(
      authenticatedPage.locator("[data-highlighted='true']"),
    ).toContainText("info");
  });

  test("should be able to specify a range of lines to search", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "info");
    await editBounds(authenticatedPage, { upper: "25" });
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/2",
    );
    await editBounds(authenticatedPage, { lower: "25" });
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
    await clearBounds(authenticatedPage);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
  });

  test("should be able to toggle case sensitivity", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "starting");
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
    await clickToggle(authenticatedPage, "case-sensitive-toggle", true);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "No Matches",
    );
    await clickToggle(authenticatedPage, "case-sensitive-toggle", false);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
  });

  test("should be able to paginate through search results", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "info");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/4",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "3/4",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "4/4",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
    await getByDataCy(authenticatedPage, "previous-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "4/4",
    );
    await getByDataCy(authenticatedPage, "previous-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "3/4",
    );
    await getByDataCy(authenticatedPage, "previous-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/4",
    );
    await getByDataCy(authenticatedPage, "previous-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
  });

  test("should not reset search index when a bookmark is applied", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "info");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/4",
    );
    await getByDataCy(authenticatedPage, "log-row-27").dblclick();
    await expect(authenticatedPage).toHaveURL(/bookmarks=0,27,297/);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/4",
    );
  });

  test("should be able to search on filtered content", async ({
    authenticatedPage,
  }) => {
    await addFilter(authenticatedPage, "installation");
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']").first(),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']"),
    ).toHaveCount(3);

    await addSearch(authenticatedPage, "info");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/2",
    );
  });

  test("should update search results automatically when filters are removed", async ({
    authenticatedPage,
  }) => {
    const filter = "nonexistent-term";
    await addFilter(authenticatedPage, filter);
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']").first(),
    ).toBeVisible();

    await addSearch(authenticatedPage, "info");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "No Matches",
    );

    await toggleDrawer(authenticatedPage);
    const filterElement = getByDataCy(authenticatedPage, `filter-${filter}`);
    await filterElement.locator(`[aria-label="Delete filter"]`).click();
    const url = authenticatedPage.url();
    expect(url).not.toContain("filters");
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']"),
    ).toBeHidden();

    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/4",
    );
    await expect(
      authenticatedPage.locator("[data-highlighted='true']"),
    ).toContainText("info");
  });
});
