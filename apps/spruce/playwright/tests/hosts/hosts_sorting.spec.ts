import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

test.describe("Hosts page sorting", () => {
  test("Clicking the sort direction filter will set the page query param to 0", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/hosts?page=5");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(getByDataCy(authenticatedPage, "hosts-table")).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "hosts-table"),
    ).not.toHaveAttribute("data-loading", "true");

    await authenticatedPage
      .getByRole("button", { name: "Sort by Distro" })
      .click();
    await expect(authenticatedPage.url()).toContain("page=0");
    await expect(authenticatedPage.url()).toContain("sorts=DISTRO");
  });

  test("Status sorter is selected by default if no sort params in url", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/hosts");
    await authenticatedPage.waitForLoadState("networkidle");
    const statusHeader = authenticatedPage
      .locator("th")
      .filter({ hasText: "Status" })
      .first();
    await expect(
      statusHeader.locator("svg[aria-label='Sort Ascending Icon']"),
    ).toBeVisible();
  });

  test("Sorts by ID when sorts = ID:ASC", async ({
    authenticatedPage,
  }) => {
    const expectedIds = [
      "16326bd716fd4ad5845710c479c79e86c66b61bcef8ebbe7fc38dfc36fab512e",
      "1694cfe1eac28b3316339f6276021afcb2a07bcd21a266405835fd039557ea2d",
      "4b332e12790a585a0c7cbaf1650674f408117cf6134679c9e5f2e96cadd07923",
      "6e331e02aaaebba422d1f1d2dbd3e64f01776b84c68c672ea680e4b81b0719bb",
      "7f909d47566126bd39a05c1a5bd5d111c2e68de3830a8be414c18c231a47f4fc",
      "a99b50cd37b012c53db7207e4ba8b52989aefab551176c07962cea979abcc479",
      "b700d10f21a5386c827251a029dd931b5ea910377e0bb93f3393b17fb9bdbd08",
      "build10.ny.cbi.10gen",
      "build10.ny.cbi.10gen.c",
      "build10.ny.cbi.10gen.cc",
    ];

    await authenticatedPage.goto("/hosts?sorts=ID%3AASC&limit=10");
    await authenticatedPage.waitForLoadState("networkidle");
    const rows = getByDataCy(authenticatedPage, "leafygreen-table-row");
    await expect(rows).toHaveCount(expectedIds.length);
    for (let i = 0; i < expectedIds.length; i++) {
      await expect(rows.nth(i)).toContainText(expectedIds[i]);
    }
  });
});
