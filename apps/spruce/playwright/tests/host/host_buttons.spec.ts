import { test, expect } from "../../fixtures";
import { getByDataCy, validateToast } from "../../helpers";

test.describe("Host page restart jasper, reprovision, and update host status buttons", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/host/i-0d0ae8b83366d22be");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("Should show a toast when jasper restarted", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "restart-jasper-button").click();
    await authenticatedPage.getByRole("button", { name: "Yes" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Marked Jasper as restarting",
    );
  });

  test("Should show a toast when host is reprovisioned", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "reprovision-button").click();
    await authenticatedPage.getByRole("button", { name: "Yes" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Marked host to reprovision",
    );
  });

  test("Should show and hide the modal for update status", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "update-status-button").click();
    await expect(
      getByDataCy(authenticatedPage, "update-host-status-modal"),
    ).toBeVisible();

    await getByDataCy(authenticatedPage, "host-status-select").click();
    await getByDataCy(authenticatedPage, "decommissioned-option").click();
    const modal = getByDataCy(authenticatedPage, "update-host-status-modal");
    await expect(
      modal.getByRole("button", { name: "Update" }),
    ).not.toHaveAttribute("aria-disabled", "true");
    await modal.getByRole("button", { name: "Update" }).click({ force: true });

    await validateToast(
      authenticatedPage,
      "success",
      "Status was changed to decommissioned",
    );
    await expect(
      authenticatedPage.locator('[data-cy="update-host-status-modal"]'),
    ).toHaveCount(0);
  });
});
