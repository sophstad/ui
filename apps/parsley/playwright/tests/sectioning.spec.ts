import { test, expect } from "../fixtures";
import { getByDataCy, clickToggle, toggleDetailsPanel } from "../helpers";

const logLink =
  "/evergreen/mongodb_mongo_master_enterprise_amazon_linux2_arm64_all_feature_flags_jsCore_patch_9801cf147ed208ce4c0ff8dff4a97cdb216f4c22_65f06bd09ccd4eaaccca1391_24_03_12_14_51_29/0/task";

test.describe("Sectioning", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`${logLink}?shareLine=0`);
    await clickToggle(
      authenticatedPage,
      "sections-toggle",
      true,
      "log-viewing",
    );
  });

  test("Toggling the sections options displays and hides sections", async ({
    authenticatedPage,
  }) => {
    // Check that sections is toggled
    await toggleDetailsPanel(authenticatedPage, true);
    await authenticatedPage
      .locator("button[data-cy='log-viewing-tab']")
      .click();
    await expect(
      getByDataCy(authenticatedPage, "sections-toggle"),
    ).toHaveAttribute("aria-checked", "true");
    await toggleDetailsPanel(authenticatedPage, false);
    // Assert sections are visible
    await expect(
      getByDataCy(authenticatedPage, "section-header").first(),
    ).toBeVisible();
    // Untoggle sections and assert they are hidden
    await clickToggle(
      authenticatedPage,
      "sections-toggle",
      false,
      "log-viewing",
    );
    await expect(
      authenticatedPage.locator("[data-cy='section-header']"),
    ).toHaveCount(0);
  });

  test("Clicking 'Open all subsections' opens all subsections", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "open-all-sections-btn").click();
    const caretToggle = getByDataCy(authenticatedPage, "caret-toggle").first();
    await expect(caretToggle).toHaveAttribute("aria-label", "Close section");
    await expect(caretToggle).not.toHaveAttribute("aria-label", "Open section");

    const sectionHeaders = authenticatedPage.locator(
      "[data-cy='section-header']",
    );
    const count = await sectionHeaders.count();
    for (let i = 0; i < count; i++) {
      await expect(sectionHeaders.nth(i)).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }

    const lineIndexes = authenticatedPage.locator(
      "[title='Use shift+click to select multiple lines']",
    );
    const lineCount = await lineIndexes.count();
    for (let i = 0; i < lineCount; i++) {
      await expect(lineIndexes.nth(i)).toHaveAttribute(
        "data-cy",
        `line-index-${i}`,
      );
    }
  });

  test("Clicking 'Close all subsections' opens all subsections", async ({
    authenticatedPage,
  }) => {
    await getByDataCy(authenticatedPage, "close-all-sections-btn").click();
    const caretToggle = getByDataCy(authenticatedPage, "caret-toggle").first();
    await expect(caretToggle).toHaveAttribute("aria-label", "Open section");
    await expect(caretToggle).not.toHaveAttribute(
      "aria-label",
      "Close section",
    );

    const lineIndexes = authenticatedPage.locator(
      "[title='Use shift+click to select multiple lines']",
    );
    await expect(lineIndexes).toHaveCount(9);

    const openLineNumbers = [0, 1, 2, 8, 9, 9616, 9617, 9618, 9619];
    const count = await lineIndexes.count();
    for (let i = 0; i < count; i++) {
      await expect(lineIndexes.nth(i)).toHaveAttribute(
        "data-cy",
        `line-index-${openLineNumbers[i]}`,
      );
    }
  });

  test("Clicking on a closed caret opens the section and renders the subsection contents", async ({
    authenticatedPage,
  }) => {
    await expect(
      authenticatedPage.locator(
        "[data-index='4'] > [data-cy='section-header']",
      ),
    ).toContainText("Function: f_expansions_write");

    await authenticatedPage
      .locator(
        "[data-index='3'] > [data-cy='section-header'] > [data-cy='caret-toggle']",
      )
      .click();

    await expect(
      authenticatedPage.locator(
        "[data-index='4'] > [data-cy='section-header']",
      ),
    ).toContainText("Command: expansions.update (step 1 of 2)");
  });

  test("Clicking on an open caret closes the section and hides the subsection contents", async ({
    authenticatedPage,
  }) => {
    await expect(
      authenticatedPage.locator(
        "[data-index='9'] > [data-cy='section-header']",
      ),
    ).toContainText("Command: expansions.write (step 2.1 of 2)");

    await authenticatedPage
      .locator(
        "[data-index='8'] > [data-cy='section-header'] > [data-cy='caret-toggle']",
      )
      .click();

    await expect(authenticatedPage.locator("[data-index='9']")).toContainText(
      "[2024/03/12 11:18:36.035] Running task commands failed: running command: command failed: process encountered problem: exit code 1",
    );
  });

  test("Failing command section is open and scrolled to on page load when share line isn't specified", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(logLink);
    await expect(
      authenticatedPage.getByText(
        "[2024/03/12 11:18:36.034] Command 'subprocess.exec' ('check resmoke failure') in function 'run tests' (step 2.20 of 2) failed: process encountered problem: exit code 1.",
      ),
    ).toBeVisible();
  });

  test("Share line section is open and scrolled to on page load when it is specified", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(`${logLink}?shareLine=19`);
    await expect(
      authenticatedPage.getByText(
        "[2024/03/12 11:01:53.831] rm -rf /data/db/* mongo-diskstats* mongo-*.tgz ~/.aws ~/.boto venv",
      ),
    ).toBeVisible();
  });
});
