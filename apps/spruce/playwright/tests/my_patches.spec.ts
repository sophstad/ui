import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

const MY_PATCHES_ROUTE = "/user/admin/patches";
const BOB_HICKS_PATCHES_ROUTE = "/user/bob.hicks/patches";
const REGULAR_USER_PATCHES_ROUTE = "/user/regular/patches";

test.describe("My Patches Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.context().addCookies([
      {
        name: "include-commit-queue-user-patches",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("Redirects user to user patches route from /user/:id", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/user/chicken");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/user/chicken/patches",
    );
  });

  test("The page title should be 'My Patches' when viewing the logged in users' patches page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(MY_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "patches-page-title"),
    ).toContainText("My Patches");
  });

  test("The page title should reflect another users patches when viewing another users patches page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(BOB_HICKS_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      authenticatedPage.getByText("Bob Hicks' Patches"),
    ).toBeVisible();

    await authenticatedPage.goto(REGULAR_USER_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      authenticatedPage.getByText("Regular User's Patches"),
    ).toBeVisible();
  });

  test("Typing in patch description input updates the url, requests patches and renders patches", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(MY_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    const inputVal = "testtest";
    await getByDataCy(authenticatedPage, "patch-description-input").type(
      inputVal,
    );
    await expect(authenticatedPage.url()).toContain(MY_PATCHES_ROUTE);
    await expect(authenticatedPage.url()).toContain(
      `patchName=${encodeURIComponent(inputVal)}`,
    );
    await getByDataCy(authenticatedPage, "patch-description-input").clear();
  });

  test("Inputting a number successfully searches patches", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(MY_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    await getByDataCy(authenticatedPage, "patch-description-input").type(
      "3186",
    );
    await expect(getByDataCy(authenticatedPage, "patch-card")).toHaveCount(1);
    await getByDataCy(authenticatedPage, "patch-description-input").clear();
  });

  test("Searching for a nonexistent patch shows 'No patches found'", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(MY_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    await getByDataCy(authenticatedPage, "patch-description-input").type(
      "satenarstharienht",
    );
    await expect(
      authenticatedPage.getByText("No patches found"),
    ).toBeVisible();
  });

  test("Grouped task status icon should link to version page with appropriate filters", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(MY_PATCHES_ROUTE);
    await authenticatedPage.waitForLoadState("networkidle");
    const badge = getByDataCy(authenticatedPage, "grouped-task-status-badge").nth(
      1,
    );
    await expect(badge).toHaveAttribute(
      "href",
      "/version/5ecedafb562343215a7ff297/tasks?statuses=success",
    );
  });
});
