import { test, expect } from "../../fixtures";
import { getByDataCy, validateToast } from "../../helpers";

test.describe("Host core", () => {
  test.describe("Host load page with nonexistent host", () => {
    test("Should show an error message when navigating to a nonexistent host id", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto("/host/not-real");
      await authenticatedPage.waitForLoadState("networkidle");
      await validateToast(
        authenticatedPage,
        "error",
        "There was an error loading the host",
        false,
      );
    });
  });

  test.describe("Host page title is displayed", () => {
    test("title shows the host name", async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/host/macos-1014-68.macstadium.build.10gen");
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(getByDataCy(authenticatedPage, "page-title")).toContainText(
        "Host: macos-1014-68.macstadium.build.10gen",
      );
    });
  });
});
