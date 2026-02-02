import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

const TASK_ID =
  "mongo_tools_ubuntu1604_qa_dump_restore_with_archiving_current_patch_b7227e1b7aeaaa6283d53b32fc03968a46b19c2d_5f15ad3c3627e07772ab2d01_20_07_20_14_42_05";

const DEFAULT_HOSTS_FIRST_PAGE = [
  "i-06f80fa6e28f93b",
  "i-06f80fa6e28f93b7",
  "i-06f80fa6e28f93b7d",
  "i-0fb9fe0592ea381",
  "i-0fb9fe0592ea3815",
  "i-0fb9fe0592ea38150",
  "macos-1014-68.macstadium.build.10gen",
  "macos-1014-68.macstadium.build.10gen.c",
  "macos-1014-68.macstadium.build.10gen.cc",
  "ubuntu1804-ppc-3.pic.build.10gen",
];

test.describe("Hosts Page Default", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/hosts?limit=10");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("Renders hosts table with hosts sorted by status by default", async ({
    authenticatedPage,
  }) => {
    const rows = getByDataCy(authenticatedPage, "leafygreen-table-row");
    await expect(rows).toHaveCount(DEFAULT_HOSTS_FIRST_PAGE.length);
    for (let i = 0; i < DEFAULT_HOSTS_FIRST_PAGE.length; i++) {
      await expect(rows.nth(i)).toContainText(DEFAULT_HOSTS_FIRST_PAGE[i]);
    }
  });

  test("ID column value links to host page", async ({
    authenticatedPage,
  }) => {
    const firstRow = getByDataCy(
      authenticatedPage,
      "leafygreen-table-row",
    ).first();
    await expect(
      firstRow.locator('[data-cy="host-id-link"]'),
    ).toHaveAttribute("href", "/host/i-06f80fa6e28f93b");
  });

  test("Current Task column value links to task page", async ({
    authenticatedPage,
  }) => {
    const firstRow = getByDataCy(
      authenticatedPage,
      "leafygreen-table-row",
    ).first();
    await expect(
      firstRow.locator('[data-cy="current-task-link"]'),
    ).toHaveAttribute("href", `/task/${TASK_ID}`);
  });
});
