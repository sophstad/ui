import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";
import { EVG_BASE_URL, users } from "../helpers/constants";

const PATCH_ID = "5e4ff3abe3c3317e352062e4";
const USER_ID = "admin";
const SPRUCE_URLS = {
  version: `/version/${PATCH_ID}/tasks`,
  userPatches: `/user/${USER_ID}/patches`,
  cli: `/preferences/cli`,
};
const LEGACY_URLS = {
  version: `${EVG_BASE_URL}/version/${PATCH_ID}`,
  userPatches: `${EVG_BASE_URL}/patches/user/${USER_ID}`,
  admin: `${EVG_BASE_URL}/admin`,
};

test.describe("Nav Bar", () => {
  const projectCookie = "mci-project-cookie";

  test("Nav Dropdown should link to patches page of most recent project if cookie exists", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.context().addCookies([
      {
        name: projectCookie,
        value: "spruce",
        domain: "localhost",
        path: "/",
      },
    ]);
    await authenticatedPage.goto(SPRUCE_URLS.userPatches);
    await getByDataCy(authenticatedPage, "auxiliary-dropdown-link").click();
    await getByDataCy(
      authenticatedPage,
      "auxiliary-dropdown-project-patches",
    ).click();
    await expect(authenticatedPage).toHaveURL(/\/project\/spruce\/patches/);
  });

  test("Nav Dropdown should link to the first distro returned by the distros resolver", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(SPRUCE_URLS.version);
    await getByDataCy(authenticatedPage, "auxiliary-dropdown-link").click();
    await expect(
      getByDataCy(authenticatedPage, "auxiliary-dropdown-distro-settings"),
    ).toHaveAttribute("href", "/distro/archlinux-test/settings/general");
  });

  test("Nav Dropdown should link to patches page of default project in SpruceConfig if cookie does not exist", async ({
    authenticatedPage,
  }) => {
    // Delete only the project cookie, not all cookies (which would remove auth token)
    const cookies = await authenticatedPage.context().cookies();
    const filteredCookies = cookies.filter((c) => c.name !== projectCookie);
    await authenticatedPage.context().clearCookies();
    if (filteredCookies.length > 0) {
      await authenticatedPage.context().addCookies(filteredCookies);
    }
    await authenticatedPage.goto(SPRUCE_URLS.userPatches);
    await authenticatedPage.waitForLoadState("networkidle");
    // Wait for navbar to be visible (it waits for GraphQL query to complete)
    await expect(
      getByDataCy(authenticatedPage, "auxiliary-dropdown-link"),
    ).toBeVisible();
    await getByDataCy(authenticatedPage, "auxiliary-dropdown-link").click();
    await expect(
      getByDataCy(authenticatedPage, "auxiliary-dropdown-project-patches"),
    ).toHaveAttribute("href", "/project/evergreen/patches");
    await getByDataCy(
      authenticatedPage,
      "auxiliary-dropdown-project-patches",
    ).click();
    await expect(authenticatedPage).toHaveURL(/\/project\/evergreen\/patches/);
  });

  test("Should update the links in the nav bar when visiting a specific project patches page", async ({
    authenticatedPage,
  }) => {
    // Delete only the project cookie, not all cookies (which would remove auth token)
    const cookies = await authenticatedPage.context().cookies();
    const filteredCookies = cookies.filter((c) => c.name !== projectCookie);
    await authenticatedPage.context().clearCookies();
    if (filteredCookies.length > 0) {
      await authenticatedPage.context().addCookies(filteredCookies);
    }
    await authenticatedPage.goto("/project/evergreen/patches");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "patch-card").first(),
    ).toBeVisible();

    await expect(
      getByDataCy(authenticatedPage, "waterfall-link"),
    ).toHaveAttribute("href", "/project/evergreen/waterfall");
    await getByDataCy(authenticatedPage, "auxiliary-dropdown-link").click();
    await expect(
      getByDataCy(authenticatedPage, "auxiliary-dropdown-project-settings"),
    ).toHaveAttribute("href", "/project/evergreen/settings");
    const cookiesAfter = await authenticatedPage.context().cookies();
    const cookie = cookiesAfter.find((c) => c.name === projectCookie);
    expect(cookie?.value).toBe("evergreen");
  });

  test("Should update the links in the nav bar when visiting a specific project settings page", async ({
    authenticatedPage,
  }) => {
    // Delete only the project cookie, not all cookies (which would remove auth token)
    const cookies = await authenticatedPage.context().cookies();
    const filteredCookies = cookies.filter((c) => c.name !== projectCookie);
    await authenticatedPage.context().clearCookies();
    if (filteredCookies.length > 0) {
      await authenticatedPage.context().addCookies(filteredCookies);
    }
    await authenticatedPage.goto("/project/spruce/settings");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "project-settings-tab-title"),
    ).toBeVisible();

    await expect(
      getByDataCy(authenticatedPage, "waterfall-link"),
    ).toHaveAttribute("href", "/project/spruce/waterfall");
    await getByDataCy(authenticatedPage, "auxiliary-dropdown-link").click();
    await expect(
      getByDataCy(authenticatedPage, "auxiliary-dropdown-project-patches"),
    ).toHaveAttribute("href", "/project/spruce/patches");
    const cookiesAfter = await authenticatedPage.context().cookies();
    const cookie = cookiesAfter.find((c) => c.name === projectCookie);
    expect(cookie?.value).toBe("spruce");
  });

  test.describe("Admin settings", () => {
    test("Should show Admin button to admins", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(SPRUCE_URLS.version);
      await getByDataCy(authenticatedPage, "user-dropdown-link").click();
      const adminLink = getByDataCy(authenticatedPage, "admin-link");
      await expect(adminLink).toBeVisible();
      await expect(adminLink).toHaveAttribute("href", LEGACY_URLS.admin);
    });

    test("Should not show Admin button to non-admins", async ({ page }) => {
      await page.context().clearCookies();
      // Login as regular user
      const response = await page.request.post(`${EVG_BASE_URL}/login`, {
        data: users.regular,
      });
      if (!response.ok()) {
        throw new Error(`Login failed: ${response.status()}`);
      }
      await page.goto(SPRUCE_URLS.version);
      await getByDataCy(page, "user-dropdown-link").click();
      await expect(getByDataCy(page, "admin-link")).not.toBeVisible();
    });
  });
});
