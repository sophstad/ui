import { test, expect } from "../../fixtures";
import {
  getByDataCy,
  addHighlight,
  addSearch,
  toggleDrawer,
  addFilter,
  clickToggle,
} from "../../helpers";

test.describe("Highlighting", () => {
  const logLink =
    "/resmoke/7e208050e166b1a9025c817b67eee48d/test/1716e11b4f8a4541c5e2faf70affbfab";

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(logLink);
  });

  test("applying a highlight should highlight the matching words", async ({
    authenticatedPage,
  }) => {
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:mongos0 ",
    );
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText(
      "ShardedClusterFixture:job0:mongos0 ",
    );
  });

  test("applying a search to a highlighted line should not overwrite an already highlighted term if the search matches the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:mongos0 ",
    );
    await addSearch(authenticatedPage, "ShardedClusterFixture:job0:mongos0 ");
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText(
      "ShardedClusterFixture:job0:mongos0 ",
    );
  });

  test("should highlight other terms in the log if the search term does not match the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:mongos0 ",
    );
    await addSearch(
      authenticatedPage,
      "ShardedClusterFixture:job0:shard0:node1",
    );
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(2);
    const count = await highlights.count();
    for (let i = 0; i < count; i++) {
      const text = await highlights.nth(i).textContent();
      expect(text).toMatch(
        /ShardedClusterFixture:job0:mongos0|ShardedClusterFixture:job0:shard0:node1/,
      );
    }
  });

  test("removing a highlight from the side panel should remove the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:shard0:node1",
    );
    await expect(
      authenticatedPage.locator("[data-cy='highlight']"),
    ).toBeVisible();
    await toggleDrawer(authenticatedPage);
    await expect(
      getByDataCy(authenticatedPage, "delete-highlight-button"),
    ).toBeVisible();
    await getByDataCy(authenticatedPage, "delete-highlight-button").click();
    await expect(
      authenticatedPage.locator("[data-cy='highlight']"),
    ).toBeHidden();
  });

  test("applying multiple highlights should use different colors", async ({
    authenticatedPage,
  }) => {
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:mongos0 ",
    );
    await addHighlight(
      authenticatedPage,
      "ShardedClusterFixture:job0:shard0:node1",
    );
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(2);
    const count = await highlights.count();
    for (let i = 0; i < count; i++) {
      const text = await highlights.nth(i).textContent();
      expect(text).toMatch(
        /ShardedClusterFixture:job0:mongos0|ShardedClusterFixture:job0:shard0:node1/,
      );
    }

    const colors = new Set<string>();
    for (let i = 0; i < count; i++) {
      const bgColor = await highlights
        .nth(i)
        .evaluate((el) => window.getComputedStyle(el).backgroundColor);
      colors.add(bgColor);
    }
    expect(colors.size).toBe(2);
  });

  test("should automatically add a highlight when a filter term is added if `Apply Highlights to Filters` is enabled", async ({
    authenticatedPage,
  }) => {
    await clickToggle(
      authenticatedPage,
      "highlight-filters-toggle",
      true,
      "search-and-filter",
    );
    await addFilter(authenticatedPage, "job0");
    await expect(
      authenticatedPage.locator("[data-cy='highlight']").first(),
    ).toBeVisible();
    await toggleDrawer(authenticatedPage);
    const sideNavHighlights = authenticatedPage.locator(
      "[data-cy='side-nav-highlight']",
    );
    await expect(sideNavHighlights).toHaveCount(1);
    await expect(sideNavHighlights.first()).toContainText("job0");
  });

  test("should not add a highlight when a filter term is added if `Apply Highlights to Filters` is disabled", async ({
    authenticatedPage,
  }) => {
    await addFilter(authenticatedPage, "job0");
    await expect(
      authenticatedPage.locator("[data-cy='highlight']"),
    ).toBeHidden();
    await toggleDrawer(authenticatedPage);
    await expect(
      authenticatedPage.locator("[data-cy='side-nav-highlight']"),
    ).toBeHidden();
  });
});
