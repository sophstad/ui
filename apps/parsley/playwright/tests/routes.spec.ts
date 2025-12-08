import { test, expect } from "../fixtures";
import { getByDataCy, validateToast } from "../helpers";

test.describe("Parsley Routes", () => {
  test("should render 'No Logs Found' when visiting a task log page of an empty log", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(
      "/evergreen/mci_ubuntu1604_test_db_patch_a1d2c8f70bf5c543de8b9641ac1ec08def1ddb26_5f74d99ab2373627c047c5e5_20_09_30_19_16_47/0/task",
    );
    await expect(authenticatedPage.getByText("No Logs Found")).toBeVisible();
  });

  test("should load task logs when visiting a task log page", async ({
    authenticatedPage,
  }) => {
    const logLink =
      "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";
    await authenticatedPage.goto(logLink);
    await expect(
      authenticatedPage.locator("[data-cy^='log-row-']").first(),
    ).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "ansi-row").first(),
    ).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "resmoke-row")).toBeHidden();
    await expect(
      authenticatedPage.getByText("Task logger initialized"),
    ).toBeVisible();
  });

  test("should show error toast when visiting a task log page of an invalid task", async ({
    authenticatedPage,
  }) => {
    const logLink = "/evergreen/invalid-task-id/0/task";
    await authenticatedPage.goto(logLink);
    // Validate toast appears and can be closed - validateToast contains multiple assertions
    await expect(authenticatedPage.locator('[data-cy="toast"]')).toBeVisible();
    await validateToast(
      authenticatedPage,
      "error",
      "Network response was not ok (404)",
      true,
    );
  });

  test("should load test results when visiting a test result page", async ({
    authenticatedPage,
  }) => {
    const logLink =
      "/test/spruce_ubuntu1604_check_codegen_d54e2c6ede60e004c48d3c4d996c59579c7bbd1f_22_03_02_15_41_35/0/JustAFakeTestInALonelyWorld";
    const testLogLine =
      "AssertionError: Timed out retrying after 4000ms: Too many elements found. Found '1', expected '0'";
    await authenticatedPage.goto(logLink);
    await expect(
      authenticatedPage.locator("[data-cy^='log-row-']").first(),
    ).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "ansi-row").first(),
    ).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "resmoke-row")).toBeHidden();
    await expect(authenticatedPage.getByText(testLogLine)).toBeVisible();
  });

  test("should load resmoke logs when visiting a resmoke log page", async ({
    authenticatedPage,
  }) => {
    const logLink =
      "/resmoke/7e208050e166b1a9025c817b67eee48d/test/1716e11b4f8a4541c5e2faf70affbfab";
    const resmokeLogLine =
      "fsm_workload_test:internal_transactions_kill_sessions";
    await authenticatedPage.goto(logLink);
    await expect(
      authenticatedPage.locator("[data-cy^='log-row-']").first(),
    ).toBeVisible();
    await expect(getByDataCy(authenticatedPage, "ansi-row")).toBeHidden();
    await expect(
      getByDataCy(authenticatedPage, "resmoke-row").first(),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText(resmokeLogLine).first(),
    ).toBeVisible();
  });

  test("should load a task uploaded file when visiting a task log page", async ({
    authenticatedPage,
  }) => {
    const logLink =
      "/taskFile/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/sample%20file";
    await authenticatedPage.goto(logLink);
    await expect(
      authenticatedPage.locator("[data-cy^='log-row-']").first(),
    ).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "ansi-row").first(),
    ).toBeVisible();
  });

  test("should show 404 when visiting a nonexistent page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/this/is/not/a/real/page");
    await expect(getByDataCy(authenticatedPage, "404")).toBeVisible();
  });
});
