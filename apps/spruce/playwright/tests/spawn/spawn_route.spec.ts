import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

test.describe("Navigating to Spawn Host and Spawn Volume pages", () => {
  test("Navigating to /spawn will redirect to /spawn/host", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/spawn");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/spawn/host",
    );
  });

  test("Navigating to /spawn/not-a-route will redirect to /spawn/host", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/spawn/not-a-route");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/spawn/host",
    );
  });

  test("Clicking on the Volume side nav item will redirect to /spawn/volume", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/spawn/host");
    await authenticatedPage.waitForLoadState("networkidle");
    await getByDataCy(authenticatedPage, "volume-nav-tab").click();
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/spawn/volume",
    );
  });

  test("Clicking on the Host side nav item will redirect to /spawn/host", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/spawn/volume");
    await authenticatedPage.waitForLoadState("networkidle");
    await getByDataCy(authenticatedPage, "host-nav-tab").click();
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/spawn/host",
    );
  });
});
