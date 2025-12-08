import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

test.describe("Viewing a patch", () => {
  test.describe("Viewing a user's own patch", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(
        "/task/mci_ubuntu1604_test_command_patch_a1d2c8f70bf5c543de8b9641ac1ec08def1ddb26_5f74d99ab2373627c047c5e5_20_09_30_19_16_47",
      );
    });

    test("Clicking on the display task breadcrumb should take you to that task", async ({
      authenticatedPage,
    }) => {
      await expect(
        getByDataCy(authenticatedPage, "bc-display-task"),
      ).toContainText("asdf");
      await getByDataCy(authenticatedPage, "bc-display-task").click();
      await expect(authenticatedPage.url()).toContain(
        "/task/mci_ubuntu1604_display_asdf_patch_a1d2c8f70bf5c543de8b9641ac1ec08def1ddb26_5f74d99ab2373627c047c5e5_20_09_30_19_16_47",
      );
    });

    test("Clicking the 'My Patches' breadcrumb goes to the logged in user's Patches Page when the current patch belongs to the logged in user", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(authenticatedPage, "bc-my-patches").click();
      await expect(authenticatedPage.url()).toContain("/user/admin/patches");
    });
  });

  test.describe("Viewing another user's patch", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(
        "/task/evergreen_ubuntu1604_dist_patch_33016573166a36bd5f46b4111151899d5c4e95b1_5ecedafb562343215a7ff297_20_05_27_21_39_46",
      );
    });

    test("Clicking on the patch name breadcrumb from a task should take you to that version", async ({
      authenticatedPage,
    }) => {
      await expect(getByDataCy(authenticatedPage, "bc-message")).toContainText(
        "Patch 1251 - dist",
      );
      await getByDataCy(authenticatedPage, "bc-message").click();
      await expect(authenticatedPage.url()).toContain(
        "/version/5ecedafb562343215a7ff297",
      );
    });

    test("Clicking the 'other users' breadcrumb goes to the patch owners Patches Page", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.getByText("Annie Black's").click();
      await expect(authenticatedPage.url()).toContain(
        "/user/annie.black/patches",
      );
    });
  });
});

test.describe("Viewing a mainline commit", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(
      "/task/evergreen_ubuntu1604_test_service_patch_5e823e1f28baeaa22ae00823d83e03082cd148ab_5e4ff3abe3c3317e352062e4_20_02_21_15_13_48",
    );
  });

  test("Clicking the commit message breadcrumb from a task should take you to that version", async ({
    authenticatedPage,
  }) => {
    await expect(getByDataCy(authenticatedPage, "bc-message")).toContainText(
      "5e823e1 - 'ever…reen/pull/3186)",
    );
    await getByDataCy(authenticatedPage, "bc-message").click();
    await expect(authenticatedPage.url()).toContain(
      "/version/5e4ff3abe3c3317e352062e4",
    );
  });

  test("Clicking on the commits link should take you to that versions waterfall", async ({
    authenticatedPage,
  }) => {
    await expect(getByDataCy(authenticatedPage, "bc-waterfall")).toContainText(
      "evergreen",
    );
    await getByDataCy(authenticatedPage, "bc-waterfall").click();
    await expect(authenticatedPage.url()).toContain(
      "/project/evergreen/waterfall",
    );
  });
});
