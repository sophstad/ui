import { useTransition, useState, useRef, useEffect, useMemo } from "react";
import { useQueryParam } from "@evg-ui/lib/hooks";
import { utcTimeZone } from "constants/time";
import { cache } from "gql/client/cache";
import { WaterfallOptions, WaterfallQueryVariables } from "gql/generated/types";
import { useUserTimeZone } from "hooks";
import { getUTCEndOfDay } from "utils/date";
import { VERSION_LIMIT } from "./constants";
import { WaterfallFilterOptions } from "./types";

type ServerFilters = Pick<
  WaterfallOptions,
  "requesters" | "statuses" | "tasks" | "variants"
>;

const resetFilterState: ServerFilters = {
  requesters: [],
  statuses: [],
  tasks: [],
  variants: [],
};

export const useQueryVariables = (
  projectIdentifier: string,
  omitInactiveBuilds: boolean,
): { queryVariables: WaterfallQueryVariables; isPending: boolean } => {
  const [maxOrder] = useQueryParam<number>(WaterfallFilterOptions.MaxOrder, 0);
  const [minOrder] = useQueryParam<number>(WaterfallFilterOptions.MinOrder, 0);
  const [revision] = useQueryParam<string | null>(
    WaterfallFilterOptions.Revision,
    null,
  );
  const [date] = useQueryParam<string>(WaterfallFilterOptions.Date, "");
  const timezone = useUserTimeZone() ?? utcTimeZone;
  const utcDate = getUTCEndOfDay(date, timezone);

  const [requesters] = useQueryParam<string[]>(
    WaterfallFilterOptions.Requesters,
    [],
  );
  const [statuses] = useQueryParam<string[]>(
    WaterfallFilterOptions.Statuses,
    [],
  );
  const [tasks] = useQueryParam<string[]>(WaterfallFilterOptions.Task, []);
  const [variants] = useQueryParam<string[]>(
    WaterfallFilterOptions.BuildVariant,
    [],
  );

  // TODO: It would be ideal to represent serverFilters with useDeferredValue to ditch the useState/useEffect pattern.
  // However, useDeferredValue's initialState option is introduced in React 19.
  const [serverFilters, setServerFilters] =
    useState<ServerFilters>(resetFilterState);
  const serverFiltersRef = useRef(resetFilterState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const newFilters = { requesters, statuses, tasks, variants };
    const hasFilters = Object.values(newFilters).some((f) => f.length);

    // Mount in particular can introduce a lot of useEffect calls due to different array references, so compare strictly
    const hasChanges =
      JSON.stringify(serverFiltersRef.current) !== JSON.stringify(newFilters);

    if (hasChanges) {
      serverFiltersRef.current = newFilters;
      if (hasFilters) {
        startTransition(() => {
          setServerFilters(newFilters);
        });
      } else {
        // Don't use a transition: if cached, the data will appear immediately
        // If not a skeleton will appear, which makes more sense than 'fetching more'
        setServerFilters(newFilters); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [requesters, statuses, tasks, variants]);

  // Memoize to avoid potentially reinvoking the query
  const queryVariables = useMemo(
    () => ({
      options: {
        projectIdentifier,
        limit: VERSION_LIMIT,
        maxOrder,
        minOrder,
        omitInactiveBuilds,
        revision,
        date: utcDate,
        ...serverFilters,
      },
    }),
    [
      projectIdentifier,
      maxOrder,
      minOrder,
      omitInactiveBuilds,
      revision,
      utcDate,
      serverFilters,
    ],
  );

  // Remove waterfall and its versions from the cache when navigating to a new project or page. It's just too big and frequently updated to keep this in the cache.
  useEffect(
    () => () => {
      cache.evict({ fieldName: "waterfall" });
      cache.gc();
    },
    [projectIdentifier],
  );

  return {
    queryVariables,
    isPending,
  };
};
