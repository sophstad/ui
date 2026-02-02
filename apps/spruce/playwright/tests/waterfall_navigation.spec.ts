import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("Waterfall navigation", () => {
  test("can view the waterfall page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/project/evergreen/waterfall");
    await expect(getByDataCy(authenticatedPage, "waterfall-page")).toBeVisible();
  });

  test("can visit other projects using project select", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/project/evergreen/waterfall");
    await expect(getByDataCy(authenticatedPage, "waterfall-page")).toBeVisible();

    await getByDataCy(authenticatedPage, "project-select").click();
    await getByDataCy(authenticatedPage, "project-display-name")
      .filter({ hasText: "Spruce" })
      .click();
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/project/spruce/waterfall",
    );
    await expect(getByDataCy(authenticatedPage, "waterfall-page")).toBeVisible();
  });
});
