import { test, expect } from "../../fixtures";
import { getByDataCy, validateToast } from "../../helpers";

test.describe("Select hosts in hosts page table", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(
      "/hosts?distroId=ubuntu1604-large&page=0&statuses=running",
    );
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(getByDataCy(authenticatedPage, "hosts-table")).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "hosts-table"),
    ).not.toHaveAttribute("data-loading", "true");
    await expect(
      getByDataCy(authenticatedPage, "update-status-button"),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "restart-jasper-button"),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "reprovision-button"),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("Selecting hosts shows hosts selection data", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.locator("thead input[type=checkbox]").check({
      force: true,
    });
    await expect(
      authenticatedPage.locator("tbody input[type=checkbox]"),
    ).toHaveCount(3);
    await expect(
      authenticatedPage.locator("tbody input[type=checkbox]").first(),
    ).toHaveAttribute("aria-checked", "true");

    await expect(
      getByDataCy(authenticatedPage, "update-status-button"),
    ).not.toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "restart-jasper-button"),
    ).not.toHaveAttribute("aria-disabled", "true");
    await expect(
      getByDataCy(authenticatedPage, "reprovision-button"),
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  test("Can restart jasper for selected hosts", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.locator("thead input[type=checkbox]").check({
      force: true,
    });
    await expect(
      getByDataCy(authenticatedPage, "restart-jasper-button"),
    ).not.toHaveAttribute("aria-disabled", "true");
    await getByDataCy(authenticatedPage, "restart-jasper-button").click();
    await expect(
      getByDataCy(authenticatedPage, "restart-jasper-button-popover"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Yes" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Marked Jasper as restarting",
    );
  });

  test("Can reprovision for selected hosts", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.locator("thead input[type=checkbox]").check({
      force: true,
    });
    await expect(
      getByDataCy(authenticatedPage, "reprovision-button"),
    ).not.toHaveAttribute("aria-disabled", "true");
    await getByDataCy(authenticatedPage, "reprovision-button").click();
    await expect(
      getByDataCy(authenticatedPage, "reprovision-button-popover"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Yes" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Marked hosts to reprovision",
    );
  });
});
