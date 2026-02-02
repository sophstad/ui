import { test, expect } from "../../fixtures";
import { getByDataCy, getInputByLabel, validateToast } from "../../helpers";

const PROJECT_WITH_REPOTRACKER_ERROR =
  "/project/mongodb-mongo-test/waterfall";

test.describe("Waterfall project banners", () => {
  test.describe("repotracker banner", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(PROJECT_WITH_REPOTRACKER_ERROR);
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("should be able to clear the repotracker error", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "repotracker-error-banner"),
      ).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "repotracker-error-trigger"),
      ).toBeVisible();
      await getByDataCy(authenticatedPage, "repotracker-error-trigger").click();
      await expect(
        getByDataCy(authenticatedPage, "repotracker-error-modal"),
      ).toBeVisible();
      const baseRevisionInput = await getInputByLabel(
        authenticatedPage,
        "Base Revision",
      );
      await baseRevisionInput.type(
        "7ad0f0571691fa5063b757762a5b103999290fa8",
      );
      await expect(
        authenticatedPage.getByRole("button", { name: "Confirm" }),
      ).not.toHaveAttribute("aria-disabled", "true");
      await authenticatedPage.getByRole("button", { name: "Confirm" }).click();
      await validateToast(
        authenticatedPage,
        "success",
        "Successfully updated merge base revision",
      );
      await expect(
        authenticatedPage.locator('[data-cy="repotracker-error-banner"]'),
      ).toHaveCount(0);
    });
  });
});
