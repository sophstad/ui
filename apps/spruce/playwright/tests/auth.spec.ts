import { test, expect } from "../fixtures";
import { logout, getByDataCy, enterLoginCredentials } from "../helpers";

test.describe("Auth", () => {
  test("Unauthenticated user is redirected to login page after visiting a private route", async ({
    page,
  }) => {
    await logout(page);
    await page.goto("/version/123123");
    await expect(page).toHaveURL(/\/login/);
  });

  test("Redirects user to My Patches page after logging in", async ({
    page,
  }) => {
    await logout(page);
    await page.goto("/");
    await enterLoginCredentials(page);
    await expect(page).toHaveURL(/\/user\/admin\/patches/);
  });

  test("Can log out via the dropdown", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");
    await expect(authenticatedPage).toHaveURL(/\/user\/admin\/patches/);
    await getByDataCy(authenticatedPage, "user-dropdown-link").click();
    await getByDataCy(authenticatedPage, "log-out").click();
    await expect(authenticatedPage).toHaveURL(/\/login/);
  });

  test("Automatically authenticates user if they are logged in", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/version/123123");
    await expect(authenticatedPage).toHaveURL(/\/version\/123123/);
  });

  test("Redirects user to their patches page if they are already logged in and visit login page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/login");
    await expect(authenticatedPage).toHaveURL(/\/user\/admin\/patches/);
  });
});
