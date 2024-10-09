/**
 * `getApiUrl()` - Get the API URL from the environment variables
 * @returns - The Evergreen API URL
 */
export const getApiUrl: () => string = () => import.meta.env.VITE_API_URL || "";

/**
 * `getSentryDSN()` - Get the Sentry Data Source Name (SENTRY_DSN) from the environment variables
 * @returns - The application's DSN
 */
export const getSentryDSN: () => string = () =>
  import.meta.env.VITE_SPRUCE_SENTRY_DSN;

/**
 * `getUiUrl()` - Get the backing evergreen URL from the environment variables
 * @returns - Returns the backing evergreen url
 */
export const getUiUrl: () => string = () => import.meta.env.VITE_UI_URL || "";

/**
 * `getSignalProcessingUrl()` - Get the TIPS Signal Processing URL from the environment variables
 * @returns - Returns the TIPS Signal Processing Iframe URL
 */
export const getSignalProcessingUrl: () => string = () =>
  import.meta.env.VITE_SIGNAL_PROCESSING_URL || "";

/**
 * `getSpruceURL()` - Get the SPRUCE URL from the environment variables
 * @returns - Returns the Spruce URL
 */
export const getSpruceURL: () => string = () => import.meta.env.VITE_SPRUCE_URL;

/**
 * `isDevelopmentBuild()` indicates if the current environment is a local development environment.
 * @returns `true` if the current environment is a local development environment.
 */
export const isDevelopmentBuild: () => boolean = () => import.meta.env.DEV;

/**
 * `isProductionBuild()` indicates if the current environment is a production bundle.
 * @returns `true` if the current environment is a production build.
 */
export const isProductionBuild = (): boolean => import.meta.env.PROD;

/**
 * `isLocal()` indicates if the current build is a local build.
 * @returns `true` if the current build is a local build.
 */
export const isLocal = () => getReleaseStage() === "development";

/**
 * `isBeta()` indicates if the current build is a build meant for a beta deployment.
 * @returns `true` if the current build is a beta build.
 */
export const isBeta = (): boolean => getReleaseStage() === "beta";

/**
 * `isStaging()` indicates if the current build is a build meant for a staging deployment.
 * @returns `true` if the current build is a staging build.
 */
export const isStaging = (): boolean => getReleaseStage() === "staging";

/**
 * `isProduction()` indicates if the current build is a build meant for a production deployment.
 * @returns `true` if the current build is a production build.
 */
export const isProduction = (): boolean => getReleaseStage() === "production";

/**
 * `isTest()` indicates if the current environment is a test environment.
 * @returns `true` if the current environment is a test environment.
 */
export const isTest = () => process.env.NODE_ENV === "test";

/**
 * `getGQLUrl()` - Get the GQL URL from the environment variables
 * @returns - Returns the graphql endpoint for the current environment.
 */
export const getGQLUrl: () => string = () => import.meta.env.VITE_GQL_URL || "";

/**
 * `getParsleyUrl()` - Get the Parsley URL from the environment variables
 * @returns - Returns the Parsley URL.
 */
export const getParsleyUrl = (): string =>
  import.meta.env.VITE_PARSLEY_URL || "";

/**
 * `getReleaseStage()` - Get the release stage from the environment variables
 * @returns - Returns the production release environment
 */
export const getReleaseStage = () => import.meta.env.MODE || "";

/**
 * `getHoneycombBaseURL()` - Get the base Honeycomb URL from the environment variables
 * @returns - Returns the base Honeycomb URL
 */
export const getHoneycombBaseURL = () =>
  import.meta.env.VITE_HONEYCOMB_BASE_URL || "";

/**
 * `getLoginDomain()` - Get the login domain depending on the release stage
 * @returns - Returns the login domain
 * in development, the dev server on port 3000 proxies the local evergreen server on port 9090
 * therefore in dev we want the login domain to be localhost:3000
 * however in prod and staging and we want the login domain to be evergreen.com
 */
export const getLoginDomain = (): string =>
  isDevelopmentBuild() || isLocal()
    ? import.meta.env.VITE_SPRUCE_URL
    : import.meta.env.VITE_UI_URL;
