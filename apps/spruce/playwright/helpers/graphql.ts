import { Route } from "@playwright/test";

export const EVG_BASE_URL = "http://localhost:9090";
export const GQL_URL = `${EVG_BASE_URL}/graphql/query`;

/**
 * Utility to match GraphQL request based on the operation name
 * @param route - The Playwright route object
 * @param operationName - The GraphQL operation name to match
 * @returns True if the route matches the operation name
 */
export function hasOperationName(route: Route, operationName: string): boolean {
  try {
    const requestBody = route.request().postDataJSON();
    return (
      Object.prototype.hasOwnProperty.call(requestBody, "operationName") &&
      requestBody.operationName === operationName
    );
  } catch (e) {
    return false;
  }
}

/**
 * Check if request is a GraphQL mutation
 * @param route - The Playwright route object
 * @returns True if the request is a GraphQL mutation
 */
export function isMutation(route: Route): boolean {
  try {
    const requestBody = route.request().postDataJSON();
    return requestBody.query?.startsWith("mutation") ?? false;
  } catch (e) {
    return false;
  }
}
