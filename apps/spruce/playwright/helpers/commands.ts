import { Page, expect, Locator, Route } from "@playwright/test";
import { EVG_BASE_URL, GQL_URL, users } from "./constants";
import { hasOperationName } from "./graphql";

/**
 * Get element by data-cy attribute
 * @param page - The Playwright page object
 * @param value - The data-cy attribute value to search for
 * @param options - Optional filter options
 * @param options.hasText - Optional text content to filter by
 * @returns A Playwright locator for the element
 */
export function getByDataCy(
  page: Page,
  value: string,
  options?: { hasText?: string | RegExp },
): Locator {
  const locator = page.locator(`[data-cy="${value}"]`);
  if (options?.hasText) {
    return locator.filter({ hasText: options.hasText });
  }
  return locator;
}

/**
 * Get element by data-row-key attribute
 * @param page - The Playwright page object
 * @param value - The data-row-key attribute value to search for
 * @returns A Playwright locator for the element
 */
export function getByDataRowKey(page: Page, value: string): Locator {
  return page.locator(`[data-row-key=${value}]`);
}

/**
 * Get element by data-test-id attribute
 * @param page - The Playwright page object
 * @param value - The data-test-id attribute value to search for
 * @returns A Playwright locator for the element
 */
export function getByDataTestId(page: Page, value: string): Locator {
  return page.locator(`[data-testid=${value}]`);
}

/**
 * Clear date picker input
 * @param page - The Playwright page object
 */
export async function clearDatePickerInput(page: Page): Promise<void> {
  // LG Date Picker does not respond well to .clear()
  await page
    .locator("input[id='day']")
    .type("{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}");
}

/**
 * Close a dismissible banner
 * @param page - The Playwright page object
 * @param dataCy - The data-cy attribute value of the banner to close
 */
export async function closeBanner(page: Page, dataCy: string): Promise<void> {
  const banner = getByDataCy(page, dataCy);
  await banner.locator("[aria-label='X Icon']").click();
}

/**
 * Enter login credentials
 * @param page - The Playwright page object
 */
export async function enterLoginCredentials(page: Page): Promise<void> {
  await getByDataCy(page, "login-username").type(users.admin.username);
  await getByDataCy(page, "login-password").type(users.admin.password);
  await getByDataCy(page, "login-submit").click();
}

/**
 * Get input by label
 * @param page - The Playwright page object
 * @param label - The label text to search for
 * @returns A Playwright locator for the input element
 */
export async function getInputByLabel(
  page: Page,
  label: string | RegExp,
): Promise<Locator> {
  // LeafyGreen inputs start out with ids of "undefined". Wait until LeafyGreen components have proper ids.
  const labelElement = page.locator("label").filter({ hasText: label });
  await expect(labelElement).toHaveAttribute("for", /.+/);
  const forAttr = await labelElement.getAttribute("for");
  if (!forAttr || forAttr === "undefined") {
    throw new Error(`Label "${label}" does not have a valid "for" attribute`);
  }
  return page.locator(`#${forAttr}`);
}

/**
 * Login to the application
 * @param page - The Playwright page object
 * @param user - User credentials object
 * @param user.username - The username to login with
 * @param user.password - The password to login with
 */
export async function login(
  page: Page,
  user: { username: string; password: string } = users.admin,
): Promise<void> {
  const cookies = await page.context().cookies();
  const hasToken = cookies.some((c) => c.name === "mci-token");

  if (hasToken) {
    return; // Already logged in
  }

  const response = await page.request.post(`${EVG_BASE_URL}/login`, {
    data: {
      username: user.username,
      password: user.password,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()}`);
  }

  // Extract cookies from the response headers
  const setCookieHeaders = response.headers()["set-cookie"];
  if (setCookieHeaders) {
    const cookieArray = Array.isArray(setCookieHeaders)
      ? setCookieHeaders
      : [setCookieHeaders];
    const parsedCookies = [];

    for (const cookieHeader of cookieArray) {
      const parts = cookieHeader.split(";");
      const nameValue = parts[0].trim().split("=");
      if (nameValue.length === 2) {
        const cookieName = nameValue[0].trim();
        const cookieValue = nameValue[1].trim();

        let domain = "localhost";
        let path = "/";

        for (const part of parts.slice(1)) {
          const trimmed = part.trim().toLowerCase();
          if (trimmed.startsWith("domain=")) {
            domain = trimmed.split("=")[1].trim();
          } else if (trimmed.startsWith("path=")) {
            path = trimmed.split("=")[1].trim();
          }
        }

        parsedCookies.push({
          name: cookieName,
          value: cookieValue,
          domain: domain,
          path: path,
        });
      }
    }

    if (parsedCookies.length > 0) {
      await page.context().addCookies(parsedCookies);
    }
  }
}

/**
 * Logout from the application
 * @param page - The Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  try {
    const currentUrl = page.url() || "http://localhost:3000";
    await page.request.get(`${EVG_BASE_URL}/logout`, {
      headers: {
        Referer: currentUrl,
      },
    });
  } catch (e) {
    // Ignore errors if page hasn't been navigated yet
    console.log("Logout request failed (may be expected):", e);
  }
  await page.context().clearCookies();
}

/**
 * Validate table sort
 * @param page - The Playwright page object
 * @param direction - The expected sort direction
 */
export async function validateTableSort(
  page: Page,
  direction?: "asc" | "desc" | "none",
): Promise<void> {
  switch (direction) {
    case "asc":
      await expect(
        page.locator("svg[aria-label='Sort Ascending Icon']"),
      ).toBeVisible();
      return;
    case "desc":
      await expect(
        page.locator("svg[aria-label='Sort Descending Icon']"),
      ).toBeVisible();
      return;
    case "none":
    default:
      await expect(
        page.locator("svg[aria-label='Unsorted Icon']"),
      ).toBeVisible();
  }
}

/**
 * Validate toast
 * @param page - The Playwright page object
 * @param type - The expected toast type
 * @param message - The expected toast message
 * @param shouldClose - Whether to close the toast after validation
 */
export async function validateToast(
  page: Page,
  type: "success" | "warning" | "error" | "info",
  message: string,
  shouldClose: boolean = true,
): Promise<void> {
  const toast = getByDataCy(page, "toast");
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute("data-variant", type);
  if (message) {
    await expect(toast).toContainText(message);
  }
  if (shouldClose) {
    await toast.locator("button[aria-label='Close Message']").click();
    await expect(toast).not.toBeVisible();
  }
}

/**
 * Select LeafyGreen option
 * @param page - The Playwright page object
 * @param label - The label of the select input
 * @param option - The option text to select
 */
export async function selectLGOption(
  page: Page,
  label: string,
  option: string | RegExp,
): Promise<void> {
  const input = await getInputByLabel(page, label);
  await input.scrollIntoViewIfNeeded();
  await expect(input).not.toHaveAttribute("aria-disabled", "true");
  await input.click(); // open select
  const listbox = page.locator('[role="listbox"]');
  await expect(listbox).toHaveCount(1);
  await listbox.locator(`text=${option}`).click();
}

/**
 * Overwrite GraphQL response
 * @param page - The Playwright page object
 * @param operationName - The GraphQL operation name to intercept
 * @param body - The response body to return
 */
export async function overwriteGQL(
  page: Page,
  operationName: string,
  body: unknown,
): Promise<void> {
  await page.route(GQL_URL, async (route: Route) => {
    if (hasOperationName(route, operationName)) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Open expandable card
 * @param page - The Playwright page object
 * @param cardTitle - The title text of the card to open
 */
export async function openExpandableCard(
  page: Page,
  cardTitle: string,
): Promise<void> {
  const cardBtn = getByDataCy(page, "expandable-card-title")
    .filter({ hasText: cardTitle })
    .locator("..")
    .locator("[role='button']")
    .first();

  const ariaExpanded = await cardBtn.getAttribute("aria-expanded");
  if (ariaExpanded !== "true") {
    await cardBtn.click();
  }
}

/**
 * Validate date picker date
 * @param page - The Playwright page object
 * @param dataCy - The data-cy attribute value of the date picker
 * @param date - The expected date values
 * @param date.year - The expected year value
 * @param date.month - The expected month value
 * @param date.day - The expected day value
 */
export async function validateDatePickerDate(
  page: Page,
  dataCy: string,
  date: { year?: string; month?: string; day?: string } = {
    year: "",
    month: "",
    day: "",
  },
): Promise<void> {
  const { year = "", month = "", day = "" } = date;
  const container = getByDataCy(page, dataCy);
  await expect(container.locator("input[id='year']")).toHaveValue(year);
  await expect(container.locator("input[id='month']")).toHaveValue(month);
  await expect(container.locator("input[id='day']")).toHaveValue(day);
}
