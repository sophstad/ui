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
    "/resmoke/7e208050e166b1a9025c817b67eee48d/test/1716e11b4f8a4541c5e2faf70affbfab";

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(logLink);
  });

  test("searching for a term should highlight matching words", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "ShardedClusterFixture:job0:mongos0 ");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText(
      "ShardedClusterFixture:job0:mongos0 ",
    );
  });

  test("searching for a term should snap the matching line to the top of the window", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "REPL_HB");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1484",
    );
    await expect(
      authenticatedPage.locator("[data-highlighted='true']"),
    ).toContainText("REPL_HB");
  });

  test("should be able to specify a range of lines to search", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "REPL_HB");
    await editBounds(authenticatedPage, { upper: "25" });
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/7",
    );
    await editBounds(authenticatedPage, { lower: "25" });
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1",
    );
    await clearBounds(authenticatedPage);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/1484",
    );
  });

  test("should be able to toggle case sensitivity", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "Mongos0");
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
    await addSearch(authenticatedPage, "conn49");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/8",
    );
    // Click the button 8 times
    for (let i = 1; i <= 7; i++) {
      await getByDataCy(authenticatedPage, "next-button").click();
      await expect(
        getByDataCy(authenticatedPage, "search-count"),
      ).toContainText(`${i + 1}/8`);
    }
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/8",
    );
    for (let i = 7; i >= 0; i--) {
      await getByDataCy(authenticatedPage, "previous-button").click();
      await expect(
        getByDataCy(authenticatedPage, "search-count"),
      ).toContainText(`${i + 1}/8`);
    }
  });

  test("should not reset search index when a bookmark is applied", async ({
    authenticatedPage,
  }) => {
    await addSearch(authenticatedPage, "conn49");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/8",
    );
    await getByDataCy(authenticatedPage, "next-button").click();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/8",
    );
    await getByDataCy(authenticatedPage, "log-row-112").dblclick();
    await expect(authenticatedPage).toHaveURL(/bookmarks=0,112,11079/);
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "2/8",
    );
  });

  test("should be able to search on filtered content", async ({
    authenticatedPage,
  }) => {
    await addFilter(authenticatedPage, "conn49");
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']").first(),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']"),
    ).toHaveCount(7);

    await addSearch(authenticatedPage, "NETWORK");
    await expect(getByDataCy(authenticatedPage, "search-count")).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "search-count")).toContainText(
      "1/7",
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

    await addSearch(authenticatedPage, "conn49");
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
      "1/8",
    );
    await expect(
      authenticatedPage.locator("[data-highlighted='true']"),
    ).toContainText("conn49");
  });
});
