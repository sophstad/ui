import { test, expect } from "../../fixtures";
import { getByDataCy, validateToast } from "../../helpers";

test.describe("Spawn volume page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/spawn/volume");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("Visiting the spawn volume page should display the number of free and mounted volumes", async ({
    authenticatedPage,
  }) => {
    await expect(
      getByDataCy(authenticatedPage, "mounted-badge"),
    ).toContainText("9 Mounted");
    await expect(
      getByDataCy(authenticatedPage, "free-badge"),
    ).toContainText("4 Free");
  });

  test("Should render migrating volumes with a different badge and disable action buttons", async ({
    authenticatedPage,
  }) => {
    const migratingRow = authenticatedPage
      .locator('[data-cy="leafygreen-table-row"]')
      .filter({ hasText: "vol-0ae8720b445b771b6" });
    await expect(
      migratingRow.locator('[data-cy="volume-status-badge"]'),
    ).toContainText("Migrating");
    await expect(
      migratingRow.locator('button[aria-label!="Expand row"]').first(),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("Should have a volume card visible initially when the 'volume' query param is provided", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(
      "/spawn/volume?volume=vol-0ea662ac92f611ed4",
    );
    await authenticatedPage.waitForLoadState("networkidle");
    const card = getByDataCy(
      authenticatedPage,
      "spawn-volume-card-vol-0ea662ac92f611ed4",
    );
    await expect(card).toBeVisible();
  });

  test("Clicking on 'Spawn Volume' should open the Spawn Volume Modal", async ({
    authenticatedPage,
  }) => {
    await expect(
      getByDataCy(authenticatedPage, "spawn-volume-btn"),
    ).not.toHaveAttribute("aria-disabled", "true");
    await getByDataCy(authenticatedPage, "spawn-volume-btn").click();
    await expect(
      getByDataCy(authenticatedPage, "spawn-volume-modal"),
    ).toBeVisible();
  });

  test.describe("Edit volume modal", () => {
    test("Clicking on 'Edit' should open the Edit Volume Modal", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(
        authenticatedPage,
        "edit-btn-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b858",
      ).click();
      await expect(
        getByDataCy(authenticatedPage, "update-volume-modal"),
      ).toBeVisible();
    });

    test("name, size, expiration inputs should be populated on initial render", async ({
      authenticatedPage,
    }) => {
      await getByDataCy(
        authenticatedPage,
        "edit-btn-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b858",
      ).click();
      await expect(
        getByDataCy(authenticatedPage, "update-volume-modal"),
      ).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "volume-name-input"),
      ).toHaveValue(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b858",
      );
      await expect(
        getByDataCy(authenticatedPage, "volume-size-input"),
      ).toHaveValue("100");
    });
  });

  test("Clicking on unmount should result in a success toast appearing", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(
      authenticatedPage,
      "detach-btn-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b857",
    ).click();
    await authenticatedPage.getByRole("button", { name: "Yes" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Successfully unmounted the volume.",
    );
  });
});
