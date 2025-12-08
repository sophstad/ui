import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

const taskLog =
  "/evergreen/mongodb_mongo_master_enterprise_amazon_linux2_arm64_all_feature_flags_jsCore_patch_9801cf147ed208ce4c0ff8dff4a97cdb216f4c22_65f06bd09ccd4eaaccca1391_24_03_12_14_51_29/0/task";

test.describe("sections feature discovery", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.context().addCookies([
      {
        name: "has-seen-sections-prod-feature-modal",
        value: "false",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("should only show the feature modal when viewing a task log", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(
      "/resmoke/mongodb_mongo_master_enterprise_amazon_linux2_arm64_all_feature_flags_jsCore_patch_9801cf147ed208ce4c0ff8dff4a97cdb216f4c22_65f06bd09ccd4eaaccca1391_24_03_12_14_51_29/0/job0/all",
    );
    await expect(
      getByDataCy(authenticatedPage, "sections-feature-modal"),
    ).toBeHidden();

    await authenticatedPage.goto(
      "/test/spruce_ubuntu1604_check_codegen_d54e2c6ede60e004c48d3c4d996c59579c7bbd1f_22_03_02_15_41_35/0/JustAFakeTestInALonelyWorld",
    );
    await expect(
      getByDataCy(authenticatedPage, "sections-feature-modal"),
    ).toBeHidden();

    await authenticatedPage.goto(taskLog);
    await expect(
      getByDataCy(authenticatedPage, "sections-feature-modal"),
    ).toBeVisible();
  });

  test("should close the feature modal when 'Let's go' is clicked", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(taskLog);
    await expect(
      getByDataCy(authenticatedPage, "sections-feature-modal"),
    ).toBeVisible();
    await authenticatedPage.getByText("Let's go").click();
    await expect(
      getByDataCy(authenticatedPage, "sections-feature-modal"),
    ).toBeHidden();

    const cookies = await authenticatedPage.context().cookies();
    const modalCookie = cookies.find(
      (c) => c.name === "has-seen-sections-prod-feature-modal",
    );
    expect(modalCookie?.value).toBe("true");
  });
});
