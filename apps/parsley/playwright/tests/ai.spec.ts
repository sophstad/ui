import { test, expect } from "../fixtures";
import { getByDataCy } from "../helpers";

const logLink =
  "/evergreen/spruce_ubuntu1604_test_2c9056df66d42fb1908d52eed096750a91f1f089_22_03_02_16_45_12/0/task";

test.describe("Parsley AI", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(logLink);
  });

  test("opens the AI drawer and logs in", async ({ authenticatedPage }) => {
    await expect(
      getByDataCy(authenticatedPage, "ansi-row").first(),
    ).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Parsley AI" }).click();
    await authenticatedPage.getByRole("button", { name: "Enable it!" }).click();
    await expect(
      authenticatedPage.getByRole("button", { name: "Enable it!" }),
    ).toBeHidden();

    // Ensure new settings are loaded with AI enabled
    await authenticatedPage.reload();

    await authenticatedPage.route(
      "http://localhost:8080/login",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Logged in successfully, you may close this window",
          }),
        });
      },
    );

    const parsleyAIButton = authenticatedPage.getByRole("button", {
      name: "Parsley AI",
    });
    await expect(parsleyAIButton).toHaveAttribute("aria-disabled", "false");
    await parsleyAIButton.click();
    await expect(
      authenticatedPage.getByText("Suggested Prompts"),
    ).toBeVisible();
  });
});
