import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

const VERSION_WITH_BANNERS =
  "/version/logkeeper_e864cf934194c161aa044e4599c8c81cee7b6237/tasks?sorts=STATUS%3AASC%3BBASE_STATUS%3ADESC";

test.describe("Version banners", () => {
  test.describe("errors", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(VERSION_WITH_BANNERS);
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("should display the number of configuration errors", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "configuration-errors-banner"),
      ).toBeVisible();
      await expect(
        authenticatedPage.getByText("4 errors in configuration file"),
      ).toBeVisible();
    });

    test("should be able to open the modal and see all errors", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(
        authenticatedPage,
        "configuration-errors-modal-trigger",
      ).click();
      const modal = getByDataCy(
        authenticatedPage,
        "configuration-errors-modal",
      );
      await expect(modal).toBeVisible();
      await expect(modal.locator("ol li")).toHaveCount(4);
    });
  });

  test.describe("warnings", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(VERSION_WITH_BANNERS);
      await authenticatedPage.waitForLoadState("networkidle");
    });

    test("should display the number of configuration warnings", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "configuration-warnings-banner"),
      ).toBeVisible();
      await expect(
        authenticatedPage.getByText(
          "3 warnings in configuration file",
        ),
      ).toBeVisible();
    });

    test("should be able to open the modal and see all warnings", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(
        authenticatedPage,
        "configuration-warnings-modal-trigger",
      ).click();
      const modal = getByDataCy(
        authenticatedPage,
        "configuration-warnings-modal",
      );
      await expect(modal).toBeVisible();
      await expect(modal.locator("ol li")).toHaveCount(3);
    });
  });

  test.describe("ignored", () => {
    test("should display a banner", async ({ authenticatedPage }) => {
      await authenticatedPage.goto(
        "/version/spruce_e695f654c8b4b959d3e12e71696c3e318bcd4c33",
      );
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "ignored-banner"),
      ).toBeVisible();
    });
  });
});
