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
    "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(logLink);
  });

  test("applying a highlight should highlight the matching words", async ({
    authenticatedPage,
  }) => {
    await addHighlight(authenticatedPage, "@bugsnag/plugin-react@");
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText("@bugsnag/plugin-react@");
  });

  test("applying a search to a highlighted line should not overwrite an already highlighted term if the search matches the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(authenticatedPage, "@bugsnag/plugin-react@");
    await addSearch(authenticatedPage, "@bugsnag/plugin-react@");
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(1);
    await expect(highlights.first()).toContainText("@bugsnag/plugin-react");
  });

  test("should highlight other terms in the log if the search term does not match the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(authenticatedPage, "@bugsnag/plugin-react@");
    await addSearch(authenticatedPage, "info");
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(5);
    const count = await highlights.count();
    for (let i = 0; i < count; i++) {
      const text = await highlights.nth(i).textContent();
      expect(text).toMatch(/@bugsnag\/plugin-react@|info/);
    }
  });

  test("removing a highlight from the side panel should remove the highlight", async ({
    authenticatedPage,
  }) => {
    await addHighlight(authenticatedPage, "@bugsnag/plugin-react@");
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
    await addHighlight(authenticatedPage, "@bugsnag/plugin-react@");
    await addHighlight(authenticatedPage, "info");
    const highlights = authenticatedPage.locator("[data-cy='highlight']");
    await expect(highlights).toHaveCount(5);
    const count = await highlights.count();
    for (let i = 0; i < count; i++) {
      const text = await highlights.nth(i).textContent();
      expect(text).toMatch(/@bugsnag\/plugin-react@|info/);
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

  test("highlights should not corrupt links", async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`${logLink}?shareLine=200`);
    await addHighlight(authenticatedPage, "github");
    await addHighlight(authenticatedPage, "storybook");
    const logRow = getByDataCy(authenticatedPage, "log-row-219");
    const link = logRow.locator("a");
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-storyfn",
    );
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
    await addFilter(authenticatedPage, "task");
    await expect(
      authenticatedPage.locator("[data-cy='highlight']").first(),
    ).toBeVisible();
    await toggleDrawer(authenticatedPage);
    const sideNavHighlights = authenticatedPage.locator(
      "[data-cy='side-nav-highlight']",
    );
    await expect(sideNavHighlights).toHaveCount(1);
    await expect(sideNavHighlights.first()).toContainText("task");
  });

  test("should not add a highlight when a filter term is added if `Apply Highlights to Filters` is disabled", async ({
    authenticatedPage,
  }) => {
    await addFilter(authenticatedPage, "task");
    await expect(
      authenticatedPage.locator("[data-cy='highlight']"),
    ).toBeHidden();
    await toggleDrawer(authenticatedPage);
    await expect(
      authenticatedPage.locator("[data-cy='side-nav-highlight']"),
    ).toBeHidden();
  });
});
