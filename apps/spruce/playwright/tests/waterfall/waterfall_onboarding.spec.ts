import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

const SEEN_WATERFALL_ONBOARDING_TUTORIAL = "seen-waterfall-onboarding-tutorial";

test.describe("Waterfall onboarding", () => {
  test("can go through all steps of the walkthrough", async ({
    authenticatedPage,
  }) => {
    const cookies = await authenticatedPage.context().cookies();
    const filtered = cookies.filter(
      (c) => c.name !== SEEN_WATERFALL_ONBOARDING_TUTORIAL,
    );
    await authenticatedPage.context().clearCookies();
    if (filtered.length > 0) {
      await authenticatedPage.context().addCookies(filtered);
    }

    await authenticatedPage.goto("/project/evergreen/waterfall");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      authenticatedPage.locator('[data-cy="waterfall-skeleton"]'),
    ).toHaveCount(0);
    await expect(
      getByDataCy(authenticatedPage, "build-variant-label"),
    ).toBeVisible();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-backdrop"),
    ).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("New Layout"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Next" }).click();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Reimagined Task Statuses"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Next" }).click();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Pin Build Variants"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Next" }).click();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Jump to Date"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Next" }).click();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Search by Git Hash"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Next" }).click();

    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Summary View"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Get started" }).click();

    await expect(
      authenticatedPage.locator('[data-cy="walkthrough-guide-cue"]'),
    ).toHaveCount(0);
    await expect(
      authenticatedPage.locator('[data-cy="walkthrough-backdrop"]'),
    ).toHaveCount(0);
  });

  test("can restart the walkthrough", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/project/evergreen/waterfall");
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      authenticatedPage.locator('[data-cy="waterfall-skeleton"]'),
    ).toHaveCount(0);
    await expect(
      getByDataCy(authenticatedPage, "build-variant-label"),
    ).toBeVisible();
    await expect(
      authenticatedPage.locator('[data-cy="walkthrough-backdrop"]'),
    ).toHaveCount(0);
    await expect(
      authenticatedPage.locator('[data-cy="walkthrough-guide-cue"]'),
    ).toHaveCount(0);

    await getByDataCy(authenticatedPage, "waterfall-menu").click();
    await getByDataCy(authenticatedPage, "restart-walkthrough").click();
    await expect(
      getByDataCy(authenticatedPage, "walkthrough-backdrop"),
    ).toBeVisible();
    await expect(
      getByDataCy(authenticatedPage, "walkthrough-guide-cue"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("New Layout"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("button", { name: "Next" }),
    ).toBeVisible();
  });
});
