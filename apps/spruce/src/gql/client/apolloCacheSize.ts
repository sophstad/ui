import type { CacheSizes } from "@apollo/client/utilities";

(globalThis as Record<symbol, unknown>)[Symbol.for("apollo.cacheSize")] = {
  "inMemoryCache.executeSelectionSet": 100_000,
} satisfies Partial<CacheSizes>;
