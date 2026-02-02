import { test, expect } from "../../fixtures";
import { getByDataCy, getInputByLabel } from "../../helpers";

const PATH_WITH_EVENTS = "/host/i-0f81a2d39744003dd";

test.describe("Host events", () => {
  test("host events display the correct text for a sample of event types", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(PATH_WITH_EVENTS);
    await authenticatedPage.waitForLoadState("networkidle");

    await expect(
      getByDataCy(authenticatedPage, "host-created").first(),
    ).toContainText("Host creation succeeded");
    await expect(
      getByDataCy(authenticatedPage, "host-provisioned").first(),
    ).toContainText("Marked as provisioned");
    await expect(
      getByDataCy(authenticatedPage, "host-task-finished").first(),
    ).toContainText("Task evergreen_ubuntu1604_test_command_patch");
  });

  test("can filter for specific events", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(PATH_WITH_EVENTS);
    await authenticatedPage.waitForLoadState("networkidle");

    await getByDataCy(authenticatedPage, "event-type-filter").click();
    await expect(
      getByDataCy(authenticatedPage, "event-type-filter-wrapper"),
    ).toBeVisible();

    const agentDeployedCheckbox = await getInputByLabel(
      authenticatedPage,
      "Agent deployed",
    );
    await agentDeployedCheckbox.check({ force: true });

    await expect(
      getByDataCy(authenticatedPage, "host-events-table-row"),
    ).toHaveCount(2);
    await expect(
      getByDataCy(authenticatedPage, "event-type-filter"),
    ).toHaveAttribute("data-highlighted", "true");

    await agentDeployedCheckbox.uncheck({ force: true });
    await expect(
      getByDataCy(authenticatedPage, "host-events-table-row"),
    ).not.toHaveCount(2);
    await expect(
      getByDataCy(authenticatedPage, "event-type-filter"),
    ).toHaveAttribute("data-highlighted", "false");
  });
});
