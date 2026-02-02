import { test, expect } from "../../fixtures";
import {
  getByDataCy,
  selectLGOption,
  validateToast,
} from "../../helpers";

test.describe("Waterfall subscription modal", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/project/spruce/waterfall");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("Displays success toast after submitting a valid form and request succeeds", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "waterfall-menu").click();
    await getByDataCy(authenticatedPage, "add-notification").click();
    await expect(
      getByDataCy(authenticatedPage, "waterfall-notification-modal"),
    ).toBeVisible();

    await selectLGOption(authenticatedPage, "Event", "Any version finishes");
    await selectLGOption(
      authenticatedPage,
      "Notification Method",
      "JIRA issue",
    );

    await getByDataCy(authenticatedPage, "jira-comment-input").type(
      "EVG-2000",
    );
    await expect(
      authenticatedPage.getByRole("button", { name: "Save" }),
    ).not.toHaveAttribute("aria-disabled", "true");
    await authenticatedPage.getByRole("button", { name: "Save" }).click();
    await validateToast(
      authenticatedPage,
      "success",
      "Your subscription has been added",
    );
  });

  test("Hides the modal after clicking the cancel button", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "waterfall-menu").click();
    await getByDataCy(authenticatedPage, "add-notification").click();
    await expect(
      getByDataCy(authenticatedPage, "waterfall-notification-modal"),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Cancel" }).click();
    await expect(
      authenticatedPage.locator('[data-cy="waterfall-notification-modal"]'),
    ).toHaveCount(0);
  });

  test("Pulls initial values from cookies", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.context().addCookies([
      {
        name: "project-notification-trigger",
        value: "any-build-fails",
        domain: "localhost",
        path: "/",
      },
      {
        name: "subscription-method",
        value: "slack",
        domain: "localhost",
        path: "/",
      },
    ]);

    await authenticatedPage.reload();
    await authenticatedPage.waitForLoadState("networkidle");
    await getByDataCy(authenticatedPage, "waterfall-menu").click();
    await getByDataCy(authenticatedPage, "add-notification").click();
    await expect(
      getByDataCy(authenticatedPage, "waterfall-notification-modal"),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Any build fails"),
    ).toBeVisible();
    await expect(authenticatedPage.getByText("Slack")).toBeVisible();
  });
});
