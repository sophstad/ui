import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("Tab shortcut", () => {
  test("toggle through tabs with 'j' and 'k' on version page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/version/5f74d99ab2373627c047c5e5/");
    await authenticatedPage.waitForLoadState("domcontentloaded");
    await authenticatedPage.locator("body").click({ position: { x: 0, y: 0 } });

    await expect(getByDataCy(authenticatedPage, "task-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("j");
    await expect(getByDataCy(authenticatedPage, "duration-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("j");
    await expect(getByDataCy(authenticatedPage, "changes-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "downstream-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "test-analysis-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "version-timing-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(getByDataCy(authenticatedPage, "task-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "version-timing-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "test-analysis-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "downstream-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(getByDataCy(authenticatedPage, "changes-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("k");
    await expect(getByDataCy(authenticatedPage, "duration-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("k");
    await expect(getByDataCy(authenticatedPage, "task-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("toggle through tabs with 'j' and 'k' on configure page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/patch/5f74d99ab2373627c047c5e5/configure");
    await authenticatedPage.waitForLoadState("domcontentloaded");
    await authenticatedPage.locator("body").click({ position: { x: 0, y: 0 } });

    await expect(getByDataCy(authenticatedPage, "tasks-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("j");
    await expect(getByDataCy(authenticatedPage, "changes-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "parameters-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(getByDataCy(authenticatedPage, "tasks-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "parameters-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(getByDataCy(authenticatedPage, "changes-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await authenticatedPage.keyboard.press("k");
    await expect(getByDataCy(authenticatedPage, "tasks-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("toggle through tabs with 'j' and 'k' on the task page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(
      "/task/mci_ubuntu1604_display_asdf_patch_a1d2c8f70bf5c543de8b9641ac1ec08def1ddb26_5f74d99ab2373627c047c5e5_20_09_30_19_16_47/",
    );
    await authenticatedPage.waitForLoadState("domcontentloaded");
    await expect(authenticatedPage).toHaveURL(/\/execution-tasks/);
    await authenticatedPage.locator("body").click({ position: { x: 0, y: 0 } });

    await expect(
      getByDataCy(authenticatedPage, "task-execution-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "task-tests-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "task-files-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "task-history-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "execution-tasks-timing-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "task-execution-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("j");
    await expect(
      getByDataCy(authenticatedPage, "task-tests-tab"),
    ).toHaveAttribute("aria-selected", "true");

    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "task-execution-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "execution-tasks-timing-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "task-history-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "task-files-tab"),
    ).toHaveAttribute("aria-selected", "true");
    await authenticatedPage.keyboard.press("k");
    await expect(
      getByDataCy(authenticatedPage, "task-tests-tab"),
    ).toHaveAttribute("aria-selected", "true");
  });
});
