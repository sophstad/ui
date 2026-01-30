import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("Shortcuts", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");
  });

  test("should be able to open the modal using keyboard shortcut", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.waitForLoadState("domcontentloaded");
    await authenticatedPage.locator("body").click({ position: { x: 0, y: 0 } });
    await authenticatedPage.keyboard.press("Shift+/");
    await expect(
      getByDataCy(authenticatedPage, "shortcut-modal"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should be able to open the keyboard shortcut modal by clicking navbar icon button", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole("button", { name: "Open shortcut modal" })
      .click();
    await expect(
      getByDataCy(authenticatedPage, "shortcut-modal"),
    ).toBeVisible({ timeout: 5000 });
  });
});
