import { test, expect } from "../fixtures";

const TASKS = {
  task1:
    "evergreen_lint_lint_service_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
  task2: "evergreen_ubuntu1604_89",
  task3:
    "patch-2-evergreen_ubuntu1604_dist_patch_33016573166a36bd5f46b4111151899d5c4e95b1_6ecedafb562343215a7ff297_20_05_27_21_39_46",
};

const TASK_STATES = {
  failedTaskWithFailedTests:
    "evergreen_ubuntu1604_test_service_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
  runningTask: "task_annotation_test",
  succeededTask:
    "evergreen_ubuntu1604_js_test_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
  failedTaskWithNoFailedTests:
    "spruce_ubuntu1604_check_codegen_69c03101ab23f54924309125432862cd4059420f_22_02_24_18_42_11",
};

test.describe("Task Page Route", () => {
  test("shouldn't get stuck in a redirect loop when visiting the task page and trying to navigate to a previous page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/user/admin/patches");
    await authenticatedPage.goto(`/task/${TASKS.task1}`);
    await authenticatedPage.goBack();
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/user/admin/patches",
    );
  });

  test("should not be redirected if they land on a task page with a tab supplied", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(`/task/${TASKS.task1}/files`);
    await expect(authenticatedPage).toHaveURL(
      `http://localhost:3000/task/${TASKS.task1}/files`,
    );
  });

  test("should load task pages for different task ids", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(`/task/${TASKS.task1}`);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      new RegExp(`/task/${TASKS.task1}`),
    );

    await authenticatedPage.goto(`/task/${TASKS.task2}`);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      new RegExp(`/task/${TASKS.task2}`),
    );

    await authenticatedPage.goto(`/task/${TASKS.task3}`);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      new RegExp(`/task/${TASKS.task3}`),
    );
  });

  test.describe("should redirect to the appropriate task tab depending on the conditions", () => {
    test("should redirect to the logs tab if the task is running", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(`/task/${TASK_STATES.runningTask}`);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage).toHaveURL(
        new RegExp(`/task/${TASK_STATES.runningTask}(/logs)?(\\?.*)?$`),
        { timeout: 15000 },
      );
    });

    test("should redirect to the logs tab if the task is in a completed state", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(`/task/${TASK_STATES.succeededTask}`);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage).toHaveURL(
        new RegExp(`/task/${TASK_STATES.succeededTask}(/logs)?(\\?.*)?$`),
        { timeout: 15000 },
      );
    });

    test("should redirect to the tests tab if the task is completed and has failed tests", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(
        `/task/${TASK_STATES.failedTaskWithFailedTests}`,
      );
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage).toHaveURL(
        new RegExp(
          `/task/${TASK_STATES.failedTaskWithFailedTests}(/tests)?(\\?.*)?$`,
        ),
        { timeout: 15000 },
      );
    });

    test("should redirect to the logs tab if the task is completed as failed and has no failed tests", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(
        `/task/${TASK_STATES.failedTaskWithNoFailedTests}`,
      );
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage.url()).toMatch(
        new RegExp(
          `/task/${TASK_STATES.failedTaskWithNoFailedTests}(/logs)?(\\?.*)?$`,
        ),
      );
    });
  });
});
