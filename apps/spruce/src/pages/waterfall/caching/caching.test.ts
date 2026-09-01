import { Suspense, createElement } from "react";
import { ApolloClient, ApolloLink } from "@apollo/client";
import {
  FieldFunctionOptions,
  FieldMergeFunctionOptions,
} from "@apollo/client/cache";
import { ApolloProvider, useSuspenseQuery } from "@apollo/client/react";
import { MockLink } from "@apollo/client/testing";
import { renderHook, waitFor } from "@evg-ui/lib/test_utils";
import { cache as apolloCache } from "gql/client/cache";
import { WaterfallQuery, WaterfallQueryVariables } from "gql/generated/types";
import { WATERFALL } from "gql/queries";
import { mergeVersions, readVersions } from ".";

type Waterfall = WaterfallQuery["waterfall"];

// @ts-expect-error: the cache tests only use plain objects.
const readField = (field, obj) => obj[field];

const makePage = (orders: number[]) => {
  const activeVersionIds = orders.map((order) => `version-${order}`);
  return {
    pagination: {
      activeVersionIds,
      hasNextPage: true,
      hasPrevPage: true,
      mostRecentVersionOrder: 20,
      nextPageOrder: Math.min(...orders),
      prevPageOrder: Math.max(...orders),
    },
    versions: orders.map((order) => ({
      id: `version-${order}`,
      order,
    })),
  } as Waterfall;
};

const page1 = makePage([20, 19, 18, 17, 16]);
const page2 = makePage([15, 14, 13, 12, 11]);
const page3 = makePage([10, 9, 8, 7, 6]);

const mergePage = (
  existing: Waterfall | undefined,
  incoming: Waterfall,
  options: Record<string, unknown> = {},
) => {
  const { cache, ...cacheOptions } = options;
  return mergeVersions(existing, incoming, {
    args: {
      options: {
        limit: 5,
        projectIdentifier: "mongodb-mongo-master",
        ...cacheOptions,
      },
    },
    cache,
    readField,
  } as unknown as FieldMergeFunctionOptions);
};

const readPage = (existing: Waterfall, options: Record<string, unknown> = {}) =>
  readVersions(existing, {
    args: { options: { limit: 5, ...options } },
    readField,
  } as unknown as FieldFunctionOptions);

const getVersionIds = (cache: Waterfall) => cache.versions.map(({ id }) => id);

const makeQueryData = (
  page: Waterfall,
  nullBuildVersionId?: string,
): WaterfallQuery => ({
  waterfall: {
    ...page,
    versions: page.versions.map(({ id, order }) => ({
      activated: true,
      createTime: new Date(),
      errors: [],
      gitTags: [],
      id,
      message: id,
      order,
      requester: "github_push_request",
      revision: id,
      user: {
        displayName: "Evergreen",
        userId: "evergreen",
      },
      waterfallBuilds:
        id === nullBuildVersionId
          ? null
          : [
              {
                activated: true,
                buildVariant: "linux",
                displayName: "Linux",
                id: `${id}-linux`,
                tasks: [],
              },
            ],
    })),
  },
});

const getQueryVariables = (
  orders: { maxOrder?: number; minOrder?: number } = {},
): WaterfallQueryVariables => ({
  options: {
    includeAllBuildsAndTasks: false,
    limit: 5,
    projectIdentifier: "mongodb-mongo-master",
    requesters: ["github_push_request"],
    statuses: ["failed"],
    tasks: ["compile"],
    variants: ["linux"],
    ...orders,
  },
});

describe("bounded waterfall cache", () => {
  it("retains up to two pages of active versions", () => {
    let cache = mergePage(undefined, page1);
    cache = mergePage(cache, page2, { maxOrder: 16 });

    expect(getVersionIds(cache)).toStrictEqual([
      ...getVersionIds(page1),
      ...getVersionIds(page2),
    ]);
  });

  it("retains up to six pages for other projects", () => {
    const pages = Array.from({ length: 7 }, (_page, pageIndex) =>
      makePage(
        Array.from(
          { length: 5 },
          (_version, versionIndex) => 35 - pageIndex * 5 - versionIndex,
        ),
      ),
    );
    let cache: Waterfall | undefined;
    pages.forEach((page, pageIndex) => {
      cache = mergePage(cache, page, {
        maxOrder: pageIndex ? 1 : 0,
        projectIdentifier: "small-project",
      });
    });

    expect(getVersionIds(cache as Waterfall)).toStrictEqual(
      pages.slice(1).flatMap(getVersionIds),
    );
  });

  it("evicts the newest active versions when paginating forward", () => {
    let cache = mergePage(undefined, page1);
    cache = mergePage(cache, page2, { maxOrder: 16 });
    cache = mergePage(cache, page3, { maxOrder: 11 });

    expect(getVersionIds(cache)).toStrictEqual([
      ...getVersionIds(page2),
      ...getVersionIds(page3),
    ]);
  });

  it("evicts the oldest active versions when paginating backward", () => {
    let cache = mergePage(undefined, page3, { maxOrder: 11 });
    cache = mergePage(cache, page2, { minOrder: 10 });
    cache = mergePage(cache, page1, { minOrder: 15 });

    expect(getVersionIds(cache)).toStrictEqual([
      ...getVersionIds(page1),
      ...getVersionIds(page2),
    ]);
  });

  it("evicts waterfall builds from discarded versions", async () => {
    const cache = {
      evict: vi.fn(),
      gc: vi.fn(),
      identify: ({ __typename, id }: { __typename: string; id: string }) =>
        `${__typename}:${id}`,
    };
    let waterfallCache = mergePage(undefined, page1);
    waterfallCache = mergePage(waterfallCache, page2, { maxOrder: 16 });
    mergePage(waterfallCache, page3, {
      cache,
      maxOrder: 11,
    });

    expect(cache.evict).toHaveBeenCalledTimes(page1.versions.length);
    expect(cache.evict).toHaveBeenCalledWith({
      broadcast: false,
      fieldName: "waterfallBuilds",
      id: "VersionLite:version-20",
    });
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(cache.gc).toHaveBeenCalledWith({ resetResultCache: true });
  });

  it("does not grow when polling an already cached page", () => {
    let cache = mergePage(undefined, page1);
    cache = mergePage(cache, page1);

    expect(getVersionIds(cache)).toStrictEqual(getVersionIds(page1));
  });

  it("does not count inactive versions toward the bound", () => {
    const pageWithInactiveVersion = {
      ...page3,
      versions: [{ id: "inactive-version", order: 10.5 }, ...page3.versions],
    } as Waterfall;
    let cache = mergePage(undefined, page1);
    cache = mergePage(cache, page2, { maxOrder: 16 });
    cache = mergePage(cache, pageWithInactiveVersion, { maxOrder: 11 });

    expect(getVersionIds(cache)).toContain("inactive-version");
    expect(
      (cache as Waterfall & { allActiveVersions: Set<string> })
        .allActiveVersions.size,
    ).toBe(10);
  });

  it("reads cached versions in either pagination direction", () => {
    let cache = mergePage(undefined, page1);
    cache = mergePage(cache, page2, { maxOrder: 16 });

    expect(getVersionIds(readPage(cache) as Waterfall)).toStrictEqual(
      getVersionIds(page1),
    );
    expect(
      getVersionIds(readPage(cache, { maxOrder: 16 }) as Waterfall),
    ).toStrictEqual(getVersionIds(page2));
    expect(
      getVersionIds(readPage(cache, { minOrder: 15 }) as Waterfall),
    ).toStrictEqual(getVersionIds(page1));
  });

  it("avoids a network request when a suspense query revisits page C", async () => {
    apolloCache.restore({});
    const requests: WaterfallQueryVariables[] = [];
    const pageBVariables = getQueryVariables({ maxOrder: 16 });
    const pageCVariables = getQueryVariables({ maxOrder: 11 });
    const reversePageBVariables = getQueryVariables({ minOrder: 10 });
    const countingLink = new ApolloLink((operation, forward) => {
      requests.push(operation.variables as WaterfallQueryVariables);
      return forward(operation);
    });
    const client = new ApolloClient({
      cache: apolloCache,
      link: countingLink.concat(
        new MockLink([
          {
            request: { query: WATERFALL, variables: pageBVariables },
            result: {
              data: makeQueryData(page2, page2.versions.at(-1)?.id),
            },
          },
          {
            request: { query: WATERFALL, variables: pageCVariables },
            result: {
              data: makeQueryData(page3, page3.versions.at(-1)?.id),
            },
          },
        ]),
      ),
    });
    const Provider = ApolloProvider as React.FC<
      React.PropsWithChildren<{ client: ApolloClient }>
    >;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(
        Provider,
        { client },
        createElement(Suspense, { fallback: null }, children),
      );
    const { rerender, result } = renderHook(
      ({ variables }) =>
        useSuspenseQuery<WaterfallQuery, WaterfallQueryVariables>(WATERFALL, {
          variables,
        }),
      {
        initialProps: { variables: pageBVariables },
        wrapper,
      },
    );
    await waitFor(() => expect(result.current.data).toBeDefined());

    rerender({ variables: pageCVariables });
    await waitFor(() =>
      expect(
        result.current.data!.waterfall.pagination.activeVersionIds,
      ).toStrictEqual([...page3.pagination.activeVersionIds].sort()),
    );
    rerender({ variables: reversePageBVariables });
    await waitFor(() =>
      expect(
        result.current.data!.waterfall.pagination.activeVersionIds,
      ).toStrictEqual([...page2.pagination.activeVersionIds].sort()),
    );
    rerender({ variables: pageCVariables });
    await waitFor(() =>
      expect(
        result.current.data!.waterfall.pagination.activeVersionIds,
      ).toStrictEqual([...page3.pagination.activeVersionIds].sort()),
    );

    expect(requests).toHaveLength(2);
  });
});
