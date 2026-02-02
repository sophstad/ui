import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

const ASCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID = [
  "i-04ade558e1e26b0ad",
  "i-07669e7a3cd2c238c",
  "i-092593689871a50dc",
];
const DESCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID = [
  "i-092593689871a50dc",
  "i-07669e7a3cd2c238c",
  "i-04ade558e1e26b0ad",
];

test.describe("Navigating to Spawn Host page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/spawn/host");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("Visiting the spawn host page should display all of your spawned hosts", async ({
    authenticatedPage,
  }) => {
    await expect(
      getByDataCy(authenticatedPage, "leafygreen-table-row"),
    ).toHaveCount(3);
  });

  test("Visiting the spawn host page should not have any cards expanded by default", async ({
    authenticatedPage,
  }) => {
    await expect(
      authenticatedPage.locator('[data-cy="spawn-host-card"]'),
    ).toHaveCount(0);
  });

  test("Clicking on a spawn host row should toggle the host card", async ({
    authenticatedPage,
  }) => {
    await expect(
      authenticatedPage.locator('[data-cy="spawn-host-card"]'),
    ).toHaveCount(0);

    await authenticatedPage
      .getByRole("button", { name: "Expand row" })
      .first()
      .click();
    await expect(
      getByDataCy(authenticatedPage, "spawn-host-card"),
    ).toBeVisible();

    await authenticatedPage
      .getByRole("button", { name: "Collapse row" })
      .first()
      .click();
    await expect(
      authenticatedPage.locator('[data-cy="spawn-host-card"]'),
    ).toHaveCount(0);
  });

  test("Visiting the spawn host page with an id in the url should open the page with the row expanded", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/spawn/host?host=i-092593689871a50dc");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "spawn-host-card").first(),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-cy="spawn-host-card"]'),
    ).toHaveCount(1);
  });

  test("Clicking on the Event Log link should redirect to /host/:hostId", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .locator('[data-cy="leafygreen-table-row"]')
      .filter({ hasText: "i-092593689871a50dc" })
      .getByRole("button", { name: "Expand row" })
      .click();
    await authenticatedPage.getByText("Event Log").click();
    await expect(authenticatedPage).toHaveURL(
      "http://localhost:3000/host/i-092593689871a50dc",
    );
  });

  test.describe("Spawn host card sorting", () => {
    test("Clicking on the host column header should sort spawn hosts by ascending order, then descending", async ({
      authenticatedPage,
    }) => {
      const hostSortButton = authenticatedPage.getByRole("button", {
        name: "Sort by Host",
      });
      await hostSortButton.click();

      const rows = getByDataCy(authenticatedPage, "leafygreen-table-row");
      for (let i = 0; i < ASCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID.length; i++) {
        await expect(rows.nth(i)).toContainText(
          ASCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID[i],
        );
      }

      await hostSortButton.click();
      for (let i = 0; i < DESCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID.length; i++) {
        await expect(rows.nth(i)).toContainText(
          DESCENDING_SORT_SPAWN_HOST_ORDER_BY_HOST_ID[i],
        );
      }
    });
  });

  test.describe("Spawn host modal", () => {
    test("Clicking on the spawn host button should open a spawn host modal", async ({
      authenticatedPage,
    }) => {
      await expect(
        authenticatedPage.locator('[data-cy="spawn-host-modal"]'),
      ).toHaveCount(0);
      await getByDataCy(authenticatedPage, "spawn-host-button").click();
      await expect(
        getByDataCy(authenticatedPage, "spawn-host-modal"),
      ).toBeVisible();
    });

    test("Visiting the spawn host page with the proper url param should open the spawn host modal by default", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto("/spawn/host?spawnHost=True");
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "spawn-host-modal"),
      ).toBeVisible();
    });

    test("Closing the spawn host modal removes the spawnHost query param from the url and hides the modal", async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto("/spawn/host?spawnHost=True");
      await authenticatedPage.waitForLoadState("networkidle");
      await expect(
        getByDataCy(authenticatedPage, "spawn-host-modal"),
      ).toBeVisible();
      await expect(authenticatedPage.url()).toContain("spawnHost=True");

      await getByDataCy(authenticatedPage, "spawn-host-modal")
        .getByRole("button", { name: "Cancel" })
        .click();
      await expect(authenticatedPage.url()).not.toContain("spawnHost");
      await expect(
        authenticatedPage.locator('[data-cy="spawn-host-modal"]'),
      ).toHaveCount(0);
    });
  });
});
