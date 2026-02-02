import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

const PATCH_ID = "5ecedafb562343215a7ff297";
const PATCH_ROUTE = `/version/${PATCH_ID}`;
const PATCHES = {
  changes: { route: `${PATCH_ROUTE}/changes`, btn: "changes-tab" },
  tasks: { route: `${PATCH_ROUTE}/tasks`, btn: "task-tab" },
  duration: { route: `${PATCH_ROUTE}/task-duration`, btn: "duration-tab" },
};

const TASKS = {
  withTests:
    "evergreen_ubuntu1604_test_model_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
  noFailedTests:
    "evergreen_ubuntu1604_test_auth_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
  noTests:
    "evergreen_lint_generate_lint_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4f02df9ccd4e6ae31f729f_20_02_21_15_13_48",
  displayTask: "evergreen_ubuntu1604_89",
};

const taskRoute = (id: string) => `/task/${id}`;
const TASK = {
  logs: {
    route: `${taskRoute(TASKS.withTests)}/logs`,
    btn: "task-logs-tab",
  },
  tests: {
    route: `${taskRoute(TASKS.withTests)}/tests`,
    btn: "task-tests-tab",
  },
  files: {
    route: `${taskRoute(TASKS.withTests)}/files`,
    btn: "task-files-tab",
  },
  display: {
    route: `${taskRoute(TASKS.displayTask)}/execution-task`,
    btn: "task-execution-tab",
  },
};

test.describe("Tabs", () => {
  test.describe("Patches page", () => {
    test("Defaults to the task tab and applies default sorts", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(PATCH_ROUTE);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, PATCHES.tasks.btn),
      ).toHaveAttribute("aria-selected", "true");
      await expect(authenticatedPage.url()).toContain(PATCHES.tasks.route);
      await expect(authenticatedPage).toHaveURL(
        /sorts=STATUS%3AASC%3BBASE_STATUS%3ADESC/,
      );
    });

    test("Applies default sorts on task duration tab", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(`${PATCH_ROUTE}/task-duration`);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, PATCHES.duration.btn),
      ).toHaveAttribute("aria-selected", "true");
      await expect(authenticatedPage.url()).toContain(PATCHES.duration.route);
      await expect(authenticatedPage).toHaveURL(/sorts=DURATION%3ADESC/);
    });

    test("replaces invalid tab names in url path with default", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(`${PATCH_ROUTE}/chicken`);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage.url()).toContain(PATCHES.tasks.route);
    });

    test("should be able to toggle between tabs", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(PATCH_ROUTE);
      await authenticatedPage.waitForLoadState("networkidle");
      await getByDataCy(authenticatedPage, PATCHES.changes.btn).click();
      await expect(getByDataCy(authenticatedPage, "code-changes")).toBeVisible();
      await getByDataCy(authenticatedPage, PATCHES.tasks.btn).click();
      await expect(getByDataCy(authenticatedPage, "total-count")).toBeVisible();
    });
  });

  test.describe("Task page", () => {
    test("selects tests tab by default if there are tests and no tab is provided in url", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(taskRoute(TASKS.withTests));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, TASK.tests.btn),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("selects logs tab by default if there are no tests and no tab is provided in url", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(taskRoute(TASKS.noTests));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "task-logs-tab"),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("toggling between tabs updates the url with the selected tab name", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(taskRoute(TASKS.withTests));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage.url()).toContain(TASK.tests.route);
      await getByDataCy(authenticatedPage, TASK.logs.btn).click();
      await expect(authenticatedPage.url()).toContain(TASK.logs.route);
      await getByDataCy(authenticatedPage, TASK.files.btn).click();
      await expect(authenticatedPage.url()).toContain(TASK.files.route);
    });

    test("replaces invalid tab names in url path with a default route", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(
        `${taskRoute(TASKS.withTests)}/chicken`,
      );
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(authenticatedPage.url()).toContain(TASK.tests.route);
    });

    test("Should only display a badge with the number of failed tests if they exist", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(taskRoute(TASKS.withTests));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "tests-tab-badge"),
      ).toContainText("1");

      await authenticatedPage.goto(taskRoute(TASKS.noFailedTests));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        authenticatedPage.locator('[data-cy="tests-tab-badge"]'),
      ).toHaveCount(0);
    });

    test("Should display a badge with the number of files in the Files tab", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(TASK.files.route);
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "files-tab-badge"),
      ).toContainText("0");
    });

    test("Should default to the execution task tab if the task is a display task", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(taskRoute(TASKS.displayTask));
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, TASK.display.btn),
      ).toHaveAttribute("aria-selected", "true");
    });
  });
});
