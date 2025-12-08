import { test, expect } from "../fixtures";
import { logout, getByDataCy } from "../helpers";

test.describe("auth", () => {
  test("unauthenticated user is redirected to login page", async ({ page }) => {
    await logout(page);
    await page.goto("/upload");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects user to upload page after logging in", async ({ page }) => {
    await logout(page);
    await page.goto("/upload");
    await getByDataCy(page, "login-username").type("admin");
    await getByDataCy(page, "login-password").type("password");
    await getByDataCy(page, "login-submit").click();
    await expect(page).toHaveURL(/\/upload/);
  });

  test("automatically authenticates user if they are logged in", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/upload");
    await expect(authenticatedPage).toHaveURL(/\/upload/);
  });

  test("redirects user to upload page if they are already logged in and visit login page", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/login");
    await expect(authenticatedPage).toHaveURL(/\/upload/);
  });
});
