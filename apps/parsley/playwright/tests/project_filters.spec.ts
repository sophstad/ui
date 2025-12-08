import { Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import { getByDataCy, resetDrawerState } from "../helpers";

test.describe("project filters", () => {
  const spruceLogLink =
    "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";
  const resmokeLogLink =
    "/resmoke/7e208050e166b1a9025c817b67eee48d/test/1716e17b99558fd9c5e2faf70a00d15d";

  const getTableCheckbox = (page: Page, index: number) => {
    const checkbox = page.locator(`[aria-label="Select row ${index}"]`);
    return checkbox;
  };

  test.beforeEach(async ({ authenticatedPage }) => {
    await resetDrawerState(authenticatedPage);
  });

  test("should show a message if there are no filters", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(spruceLogLink);
    await authenticatedPage.getByText("View project filters").click();
    await expect(
      getByDataCy(authenticatedPage, "project-filters-modal"),
    ).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "project-filter")).toBeHidden();
    await expect(
      getByDataCy(authenticatedPage, "no-filters-message"),
    ).toBeVisible();
  });

  test("should be able to apply a filter", async ({ authenticatedPage }) => {
    await authenticatedPage.goto(resmokeLogLink);
    await authenticatedPage.getByText("View project filters").click();
    await expect(
      getByDataCy(authenticatedPage, "project-filters-modal"),
    ).toBeVisible();
    // Click the filter name text to check the checkbox (like Cypress does)
    // This is more reliable than clicking the checkbox directly
    await authenticatedPage
      .getByText("(NETWORK|ASIO|EXECUTOR|CONNPOOL|REPL_HB)")
      .click();
    // Wait for React to process the checkbox change and enable the button
    const applyButton = authenticatedPage.getByRole("button", {
      name: "Apply filters",
    });
    await applyButton.waitFor({ state: "visible" });
    // Wait for button to be enabled
    await expect(applyButton).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5000,
    });
    await applyButton.click();
    const url = authenticatedPage.url();
    expect(url).toContain(
      "111%28NETWORK%257CASIO%257CEXECUTOR%257CCONNPOOL%257CREPL_HB%29",
    );
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']").first(),
    ).toBeVisible();
  });

  test("should allow clicking on the filter name to check the checkbox", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(resmokeLogLink);
    await authenticatedPage.getByText("View project filters").click();
    await expect(
      getByDataCy(authenticatedPage, "project-filters-modal"),
    ).toBeVisible();
    await authenticatedPage
      .getByText("(NETWORK|ASIO|EXECUTOR|CONNPOOL|REPL_HB)")
      .click();
    await expect(getTableCheckbox(authenticatedPage, 0)).toBeChecked();
  });

  test("properly processes filters with commas", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(resmokeLogLink);
    await authenticatedPage.getByText("View project filters").click();
    await expect(
      getByDataCy(authenticatedPage, "project-filters-modal"),
    ).toBeVisible();
    // Click the filter name text for row 3 (filter with commas)
    // Scope to the table to avoid matching log content
    const table = authenticatedPage.getByTestId("lg-table");
    await table.getByText('"Connection accepted","attr"').first().click();
    // Wait for React to process the checkbox change and enable the button
    const applyButton = authenticatedPage.getByRole("button", {
      name: "Apply filters",
    });
    await applyButton.waitFor({ state: "visible" });
    // Wait for button to be enabled
    await expect(applyButton).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5000,
    });
    await applyButton.click();
    const url = authenticatedPage.url();
    expect(url).toContain(
      "110%2522Connection%2520accepted%2522%252C%2522attr%2522",
    );
    await expect(
      authenticatedPage.locator("[data-cy^='skipped-lines-row-']").first(),
    ).toBeVisible();
  });

  test("should disable checkbox if filter is already applied", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(`${resmokeLogLink}?filters=111D%255Cd`);
    await authenticatedPage.getByText("View project filters").click();
    await expect(
      getByDataCy(authenticatedPage, "project-filters-modal"),
    ).toBeVisible();
    await expect(getTableCheckbox(authenticatedPage, 1)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
