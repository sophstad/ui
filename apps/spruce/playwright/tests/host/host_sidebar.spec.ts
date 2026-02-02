import { test, expect } from "../../fixtures";
import { getByDataCy } from "../../helpers";

const PATH_WITH_TASK = "/host/i-0fb9fe0592ea3815";
const PATH_NO_TASK = "/host/macos-1014-68.macstadium.build.10gen";

test.describe("Host page title and sidebar", () => {
  test("title shows the host name", async ({ authenticatedPage }) => {
    await authenticatedPage.goto(PATH_NO_TASK);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(getByDataCy(authenticatedPage, "page-title")).toContainText(
      "Host: macos-1014-68.macstadium.build.10gen",
    );
  });

  test("Metadata card Current task should display none when running task does not exist", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(PATH_NO_TASK);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "current-running-task"),
    ).toContainText("none");
  });

  test("Metadata card Distro and current running links should have href", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(PATH_WITH_TASK);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "distro-link"),
    ).toHaveAttribute("href", /.+/);
    await expect(
      getByDataCy(authenticatedPage, "running-task-link"),
    ).toHaveAttribute("href", /.+/);
  });

  test("sshCommand has the correct values", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(PATH_WITH_TASK);
    await authenticatedPage.waitForLoadState("networkidle");
    await expect(
      getByDataCy(authenticatedPage, "ssh-command"),
    ).toContainText("ssh admin@ec2-54-146-18-248.compute-1.amazonaws.com");
  });
});
