import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "../../fixtures";
import { getByDataCy, paste } from "../../helpers";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Upload page", () => {
  test.describe("uploading logs", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/upload");
    });

    test("should be able to drag and drop a file", async ({
      authenticatedPage,
    }) => {
      await expect(getByDataCy(authenticatedPage, "upload-zone")).toBeVisible();
      const filePath = path.resolve(
        __dirname,
        "../../../sample_logs/resmoke.log",
      );
      // Find the actual file input element (it's inside the upload zone)
      const fileInput = authenticatedPage.locator("input[type=file]");
      await fileInput.setInputFiles(filePath);
      await expect(
        getByDataCy(authenticatedPage, "parse-log-select"),
      ).toBeVisible();
    });

    test("should be able to select a file", async ({ authenticatedPage }) => {
      const filePath = path.resolve(
        __dirname,
        "../../../sample_logs/resmoke.log",
      );
      await authenticatedPage
        .locator("input[type=file]")
        .setInputFiles(filePath);
      await expect(
        getByDataCy(authenticatedPage, "parse-log-select"),
      ).toBeVisible();
    });

    test("selecting a log type should render the log with the appropriate parser", async ({
      authenticatedPage,
    }) => {
      const filePath = path.resolve(
        __dirname,
        "../../../sample_logs/resmoke.log",
      );
      await authenticatedPage
        .locator("input[type=file]")
        .setInputFiles(filePath);
      await expect(
        getByDataCy(authenticatedPage, "parse-log-select"),
      ).toBeVisible();
      await getByDataCy(authenticatedPage, "parse-log-select").click();
      // Use getByTestId to find the select popover, then get Resmoke from there
      await authenticatedPage
        .getByTestId("lg-select-popover")
        .getByText("Resmoke")
        .click();
      await getByDataCy(authenticatedPage, "process-log-button").click();
      await expect(getByDataCy(authenticatedPage, "log-window")).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "resmoke-row").first(),
      ).toBeVisible();
    });
  });

  test.describe("uploading logs via clipboard", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Mock clipboard for testing
      await authenticatedPage.goto("/upload");
      await authenticatedPage.evaluate(() => {
        // Stub clipboard readText
        Object.defineProperty(navigator, "clipboard", {
          value: {
            readText: async () => "sample_logs/resmoke.log",
          },
        });
      });
    });

    test("should be able to paste text into Parsley", async ({
      authenticatedPage,
    }) => {
      await expect(getByDataCy(authenticatedPage, "upload-zone")).toBeVisible();
      const fileInput = authenticatedPage.locator("input[type=file]");
      // eslint-disable-next-line playwright/no-force-option -- File input is intercepted by upload zone overlay, force click is necessary
      await fileInput.click({ force: true });
      await authenticatedPage.locator("body").click();

      await paste(authenticatedPage, fileInput, {
        pasteFormat: "text",
        pastePayload: "sample_logs/resmoke.log",
      });
      await expect(
        getByDataCy(authenticatedPage, "parse-log-select"),
      ).toBeVisible();
    });

    test("selecting a log type should render the log with the appropriate parser", async ({
      authenticatedPage,
    }) => {
      const fileInput = authenticatedPage.locator("input[type=file]");
      await paste(authenticatedPage, fileInput, {
        pasteFormat: "text",
        pastePayload: "sample_logs/resmoke.log",
      });
      await expect(
        getByDataCy(authenticatedPage, "parse-log-select"),
      ).toBeVisible();
      await getByDataCy(authenticatedPage, "parse-log-select").click();
      // Use getByTestId to find the select popover, then get Resmoke from there
      await authenticatedPage
        .getByTestId("lg-select-popover")
        .getByText("Resmoke")
        .click();
      await getByDataCy(authenticatedPage, "process-log-button").click();
      await expect(getByDataCy(authenticatedPage, "log-window")).toBeVisible();
      await expect(
        getByDataCy(authenticatedPage, "resmoke-row").first(),
      ).toBeVisible();
      await expect(getByDataCy(authenticatedPage, "resmoke-row")).toContainText(
        "sample_logs/resmoke.log",
      );
    });
  });

  test.describe("navigating away", () => {
    const logLink =
      "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";

    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto(logLink);
    });

    test("trying to navigate away to the upload page should prompt the user", async ({
      authenticatedPage,
    }) => {
      await expect(getByDataCy(authenticatedPage, "log-window")).toBeVisible();
      await getByDataCy(authenticatedPage, "upload-link").click();
      await expect(
        getByDataCy(authenticatedPage, "confirmation-modal"),
      ).toBeVisible();
      await authenticatedPage.getByRole("button", { name: "Confirm" }).click();
      await expect(getByDataCy(authenticatedPage, "upload-zone")).toBeVisible();
    });
  });
});
