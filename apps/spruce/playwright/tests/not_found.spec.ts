import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("404 Page", () => {
  test("Displays 404 page for routes that do not exist when user is logged in", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/i-still-dont-exist");
    await expect(getByDataCy(authenticatedPage, "404")).toBeVisible();

    await authenticatedPage.goto("/patch/5e4ff3abe3c3317e352062e4");
    await expect(authenticatedPage.locator('[data-cy="404"]')).toHaveCount(0);
  });
});
