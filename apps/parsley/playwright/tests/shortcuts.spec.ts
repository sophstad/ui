import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("Shortcuts", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");
  });

  test("should be able to open the modal using keyboard shortcut", async ({
    authenticatedPage,
  }) => {
    await expect(getByDataCy(authenticatedPage, "shortcut-modal")).toBeHidden();
    await authenticatedPage.keyboard.press("Shift+/");
    await expect(
      getByDataCy(authenticatedPage, "shortcut-modal"),
    ).toBeVisible();
  });

  test("should be able to open the keyboard shortcut modal by clicking navbar icon button", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .locator(`[aria-label="Open shortcut modal"]`)
      .click();
    await expect(
      getByDataCy(authenticatedPage, "shortcut-modal"),
    ).toBeVisible();
  });
});
