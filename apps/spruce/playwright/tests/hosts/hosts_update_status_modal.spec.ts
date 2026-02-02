import { test, expect } from "../../fixtures";
import { getByDataCy, validateToast } from "../../helpers";

test.describe("Hosts Update Status Modal", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/hosts?limit=100&page=0");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(getByDataCy(authenticatedPage, "hosts-table")).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "hosts-table"),
    ).not.toHaveAttribute("data-loading", "true");
  });

  test("Update status for selected hosts", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .locator("thead input[type=checkbox]")
      .check({ force: true });

    await getByDataCy(authenticatedPage, "update-status-button").click();

    await getByDataCy(authenticatedPage, "host-status-select").click();
    await getByDataCy(authenticatedPage, "terminated-option").click();

    await getByDataCy(authenticatedPage, "host-status-notes").type("notes");

    await expect(
      getByDataCy(authenticatedPage, "update-host-status-modal"),
    ).toBeVisible();
    await getByDataCy(authenticatedPage, "update-host-status-modal")
      .getByRole("button", { name: "Update" })
      .click({ force: true });
    await expect(
      authenticatedPage.locator('[data-cy="update-host-status-modal"]'),
    ).toHaveCount(0);
    await validateToast(
      authenticatedPage,
      "success",
      "Status was changed to terminated",
    );
  });
});
