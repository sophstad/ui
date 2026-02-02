import { test, expect } from "../../fixtures";
import { getByDataCy, getInputByLabel } from "../../helpers";

test.describe("Hosts page filtering from table filters", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/hosts?page=0");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(getByDataCy(authenticatedPage, "hosts-table")).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "hosts-table"),
    ).toHaveAttribute("data-loading", "false");
  });

  test("Filters hosts using table filter dropdowns for hostId", async ({
    authenticatedPage,
  }) => {
    const filterValue = "i-0d0ae8b83366d22";
    const expectedIds = ["i-0d0ae8b83366d22"];

    await getByDataCy(authenticatedPage, "host-id-filter").click();
    await expect(
      getByDataCy(authenticatedPage, "host-id-filter-wrapper"),
    ).toBeVisible();

    const searchInput = authenticatedPage.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.type(`${filterValue}{Enter}`);

    await expect(
      getByDataCy(authenticatedPage, "host-id-filter-wrapper"),
    ).not.toBeVisible();
    await expect(authenticatedPage.url()).toContain(
      `hostId=${encodeURIComponent(filterValue)}`,
    );
    await expect(
      getByDataCy(authenticatedPage, "hosts-table"),
    ).toHaveAttribute("data-loading", "false");

    for (const id of expectedIds) {
      await expect(
        getByDataCy(authenticatedPage, "leafygreen-table-row").filter({
          hasText: id,
        }),
      ).toBeVisible();
    }
  });

  test("Filters hosts using table filter dropdowns for statuses (Running)", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "statuses-filter").click();
    await expect(
      getByDataCy(authenticatedPage, "statuses-filter-wrapper"),
    ).toBeVisible();

    const runningCheckbox = await getInputByLabel(
      authenticatedPage,
      "Running",
    );
    await runningCheckbox.check({ force: true });
    await getByDataCy(authenticatedPage, "statuses-filter").click();

    await expect(
      getByDataCy(authenticatedPage, "statuses-filter-wrapper"),
    ).not.toBeVisible();
    await expect(authenticatedPage.url()).toContain("statuses=running");
  });
});
