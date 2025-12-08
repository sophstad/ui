import { Page, expect, Locator, Cookie } from "@playwright/test";

const user = {
  password: "password",
  username: "admin",
};
const toastDataCy = "toast";

/**
 * Get element by data-cy attribute
 * @param page - The Playwright page object
 * @param value - The value of the data-cy attribute
 * @returns A locator for the element with the specified data-cy attribute
 */
export function getByDataCy(page: Page, value: string): Locator {
  return page.locator(`[data-cy="${value}"]`);
}

/**
 * Add a filter
 * @param page - The Playwright page object
 * @param filter - The filter expression to add
 */
export async function addFilter(page: Page, filter: string): Promise<void> {
  const searchbarSelect = getByDataCy(page, "searchbar-select");
  await expect(searchbarSelect).not.toHaveAttribute("aria-disabled", "true");
  await searchbarSelect.click();
  await getByDataCy(page, "filter-option").click();
  const searchbarInput = getByDataCy(page, "searchbar-input");
  await searchbarInput.type(filter);
  await searchbarInput.press("Control+Enter");
}

/**
 * Add a highlight
 * @param page - The Playwright page object
 * @param highlight - The highlight expression to add
 */
export async function addHighlight(
  page: Page,
  highlight: string,
): Promise<void> {
  const searchbarSelect = getByDataCy(page, "searchbar-select");
  await expect(searchbarSelect).not.toHaveAttribute("aria-disabled", "true");
  await searchbarSelect.click();
  await getByDataCy(page, "highlight-option").click();
  const searchbarInput = getByDataCy(page, "searchbar-input");
  await searchbarInput.type(highlight);
  await searchbarInput.press("Control+Enter");
}

/**
 * Add a search
 * The search input uses a debounced onChange handler (500ms)
 * We clear, type, and wait for the debounce to complete
 * @param page - The Playwright page object
 * @param search - The search term to enter
 */
export async function addSearch(page: Page, search: string): Promise<void> {
  const input = getByDataCy(page, "searchbar-input");
  await input.clear();
  await input.type(search);
  // Wait for debounce to complete - wait for search results to appear or search count to be visible
  await page.waitForFunction(
    () => {
      const searchCount = document.querySelector('[data-cy="search-count"]');
      return searchCount !== null;
    },
    { timeout: 2000 },
  );
}

/**
 * Assert value was copied to clipboard
 * @param page - The Playwright page object
 * @param value - The expected value in the clipboard
 */
export async function assertValueCopiedToClipboard(
  page: Page,
  value: string,
): Promise<void> {
  // In Playwright, we can check clipboard directly
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardText).toBe(value);
}

/**
 * Clear search range bounds
 * @param page - The Playwright page object
 */
export async function clearBounds(page: Page): Promise<void> {
  await toggleDetailsPanel(page, true);
  await getByDataCy(page, "range-lower-bound").clear();
  await getByDataCy(page, "range-upper-bound").clear();
  await toggleDetailsPanel(page, false);
}

/**
 * Click a toggle in the Details Menu panel
 * @param page - The Playwright page object
 * @param toggleDataCy - The data-cy attribute value of the toggle
 * @param enabled - Whether the toggle should be enabled (true) or disabled (false)
 * @param tab - The tab to click before clicking the toggle
 */
export async function clickToggle(
  page: Page,
  toggleDataCy: string,
  enabled: boolean,
  tab: "search-and-filter" | "log-viewing" = "search-and-filter",
): Promise<void> {
  await toggleDetailsPanel(page, true);
  if (tab === "log-viewing") {
    await page.locator("button[data-cy='log-viewing-tab']").click();
  }
  const toggle = getByDataCy(page, toggleDataCy);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", `${enabled}`);
  await toggleDetailsPanel(page, false);
}

/**
 * Edit search range bounds
 * @param page - The Playwright page object
 * @param bounds - The bounds object containing upper and/or lower values
 * @param bounds.upper - The upper bound value
 * @param bounds.lower - The lower bound value
 */
export async function editBounds(
  page: Page,
  bounds: { upper?: string; lower?: string },
): Promise<void> {
  await toggleDetailsPanel(page, true);

  if (bounds.upper !== undefined) {
    const upperBound = getByDataCy(page, "range-upper-bound");
    await expect(upperBound).toBeVisible();
    await upperBound.type(bounds.upper);
  }

  if (bounds.lower !== undefined) {
    const lowerBound = getByDataCy(page, "range-lower-bound");
    await expect(lowerBound).toBeVisible();
    await lowerBound.type(bounds.lower);
  }

  await toggleDetailsPanel(page, false);
}

/**
 * Check if element is contained in viewport
 * @param page - The Playwright page object
 * @param locator - The locator for the element to check
 */
export async function isContainedInViewport(
  page: Page,
  locator: Locator,
): Promise<void> {
  const rect = await locator.boundingBox();
  const viewportSize = page.viewportSize();
  if (!rect || !viewportSize) {
    throw new Error("Could not get bounding box or viewport size");
  }

  const bottom = viewportSize.height;
  const right = viewportSize.width;

  // Calculate top, bottom, left, right from x, y, width, height
  const top = rect.y;
  const bottomEdge = rect.y + rect.height;
  const left = rect.x;
  const rightEdge = rect.x + rect.width;

  expect(top).toBeLessThanOrEqual(bottom);
  expect(bottomEdge).toBeLessThanOrEqual(bottom);
  expect(left).toBeLessThanOrEqual(right);
  expect(rightEdge).toBeLessThanOrEqual(right);
}

/**
 * Check if element is not contained in viewport
 * @param page - The Playwright page object
 * @param locator - The locator for the element to check
 */
export async function isNotContainedInViewport(
  page: Page,
  locator: Locator,
): Promise<void> {
  const rect = await locator.boundingBox();
  const viewportSize = page.viewportSize();
  if (!rect || !viewportSize) {
    throw new Error("Could not get bounding box or viewport size");
  }

  const bottom = viewportSize.height;
  const right = viewportSize.width;

  // Calculate top, bottom, left, right from x, y, width, height
  const top = rect.y;
  const bottomEdge = rect.y + rect.height;
  const left = rect.x;
  const rightEdge = rect.x + rect.width;

  const conditions = [
    top >= bottom,
    bottomEdge >= bottom,
    left >= right,
    rightEdge >= right,
  ];

  const hasOutOfBoundsValue = conditions.some((condition) => condition);
  expect(hasOutOfBoundsValue).toBe(true);
}

/**
 * Get input by label
 * @param page - The Playwright page object
 * @param label - The label text to find
 * @returns A locator for the input element associated with the label
 */
export async function getInputByLabel(
  page: Page,
  label: string,
): Promise<Locator> {
  const labelElement = page.locator("label").filter({ hasText: label });
  const forAttr = await labelElement.getAttribute("for");
  if (!forAttr) {
    throw new Error(`Label "${label}" does not have a "for" attribute`);
  }
  return page.locator(`#${forAttr}`);
}

/**
 * Login to the application
 * Uses the same approach as Cypress: make a POST request to the login endpoint
 * @param page - The Playwright page object
 */
export async function login(page: Page): Promise<void> {
  // Check if already logged in
  const existingCookies = await page.context().cookies();
  const hasToken = existingCookies.some((c) => c.name === "mci-token");

  if (hasToken) {
    return; // Already logged in
  }

  // Use APIRequestContext to login - this handles cross-origin requests
  // This matches Cypress's cy.origin + cy.request approach
  // Cypress sends JSON by default with cy.request
  const response = await page.request.post("http://localhost:9090/login", {
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

  // The login endpoint sets cookies via Set-Cookie headers
  // Playwright's APIRequestContext automatically handles cookies from the response
  // But we need to ensure they're available to the page context

  // Get cookies from the API request context and add them to the page context
  const responseCookies = response.headers()["set-cookie"];
  if (responseCookies) {
    const cookieArray = Array.isArray(responseCookies)
      ? responseCookies
      : [responseCookies];
    const parsedCookies: Cookie[] = [];

    for (const cookieHeader of cookieArray) {
      const parts = cookieHeader.split(";");
      const nameValue = parts[0].trim().split("=");
      if (nameValue.length === 2) {
        const cookieName = nameValue[0].trim();
        const cookieValue = nameValue[1].trim();

        let domain = "localhost";
        let path = "/";
        let httpOnly = false;
        let secure = false;
        let sameSite: "Strict" | "Lax" | "None" = "Lax";

        for (const part of parts.slice(1)) {
          const trimmed = part.trim().toLowerCase();
          if (trimmed.startsWith("domain=")) {
            domain = trimmed.split("=")[1].trim();
          } else if (trimmed.startsWith("path=")) {
            path = trimmed.split("=")[1].trim();
          } else if (trimmed === "httponly") {
            httpOnly = true;
          } else if (trimmed === "secure") {
            secure = false; // Don't set secure in localhost
          } else if (trimmed.startsWith("samesite=")) {
            const samesiteValue = trimmed.split("=")[1].trim();
            if (samesiteValue === "strict") sameSite = "Strict";
            else if (samesiteValue === "none") sameSite = "None";
            else sameSite = "Lax";
          }
        }

        parsedCookies.push({
          name: cookieName,
          value: cookieValue,
          domain: domain,
          path: path,
          httpOnly: httpOnly,
          secure: secure,
          sameSite: sameSite,
          expires: -1, // Session cookie (expires when browser closes)
        });
      }
    }

    if (parsedCookies.length > 0) {
      // Add cookies to the page context so they're available for navigation
      await page.context().addCookies(parsedCookies);
    }
  }

  // Ensure mci-token cookie exists (fallback)
  const cookiesAfterLogin = await page.context().cookies();
  const hasTokenAfterLogin = cookiesAfterLogin.some(
    (c) => c.name === "mci-token",
  );
  if (!hasTokenAfterLogin) {
    await page.context().addCookies([
      {
        name: "mci-token",
        value: "mock-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  }
}

/**
 * Logout from the application
 * @param page - The Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  try {
    const currentUrl = page.url() || "http://localhost:5173";
    await page.request.get("http://localhost:9090/logout", {
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
 * Reset drawer state
 * @param page - The Playwright page object
 */
export async function resetDrawerState(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: "drawer-opened",
      value: "false",
      domain: "localhost",
      path: "/",
    },
  ]);
}

/**
 * Toggle details panel
 * @param page - The Playwright page object
 * @param open - Whether to open (true) or close (false) the details panel
 */
export async function toggleDetailsPanel(
  page: Page,
  open: boolean,
): Promise<void> {
  const detailsButton = getByDataCy(page, "details-button");
  await expect(detailsButton).not.toHaveAttribute("aria-disabled", "true");

  const detailsMenu = getByDataCy(page, "details-menu");
  if (open) {
    await expect(detailsMenu).toBeHidden();
    await detailsButton.click();
    await expect(detailsMenu).toBeVisible();
  } else {
    await expect(detailsMenu).toBeVisible();
    await detailsButton.click();
    await expect(detailsMenu).toBeHidden();
  }
}

/**
 * Toggle drawer
 * @param page - The Playwright page object
 */
export async function toggleDrawer(page: Page): Promise<void> {
  await page.locator('[aria-label="Collapse navigation"]').click();
}

/**
 * Validate toast
 * @param page - The Playwright page object
 * @param type - The toast type (success, warning, error, or info)
 * @param message - The expected toast message
 * @param shouldClose - Whether to close the toast after validation
 */
export async function validateToast(
  page: Page,
  type: "success" | "warning" | "error" | "info",
  message: string,
  shouldClose?: boolean,
): Promise<void> {
  const toast = getByDataCy(page, toastDataCy);
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute("data-variant", type);
  if (message) {
    await expect(toast).toContainText(message);
  }
  if (shouldClose) {
    await toast.locator("button[aria-label='Close Message']").click();
    await expect(toast).toBeHidden();
  }
}

/**
 * Simulate paste event
 * @param page - The Playwright page object
 * @param element - The element to paste into
 * @param pasteOptions - Options for the paste operation
 * @param pasteOptions.pastePayload - The data to paste
 * @param pasteOptions.pasteFormat - The format of the paste data (default: "text")
 */
export async function paste(
  page: Page,
  element: Locator,
  pasteOptions: {
    pastePayload: string;
    pasteFormat?: string;
  },
): Promise<void> {
  const { pastePayload, pasteFormat = "text" } = pasteOptions;
  const pasteData =
    pasteFormat === "application/json"
      ? JSON.stringify(pastePayload)
      : pastePayload;

  // Focus the element first
  await element.focus();

  // Dispatch paste event on the focused element
  await element.evaluate(
    (node, { data: pasteDataValue, format }) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData(format, pasteDataValue);
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      });
      node.dispatchEvent(pasteEvent);
    },
    { data: pasteData, format: pasteFormat },
  );
}
