import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSuspenseQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { fromZonedTime } from "date-fns-tz";
import {
  DEFAULT_POLL_INTERVAL,
  WATERFALL_PINNED_VARIANTS_KEY,
} from "constants/index";
import { utcTimeZone } from "constants/time";
import {
  WaterfallPagination,
  WaterfallQuery,
  WaterfallQueryVariables,
  WaterfallVersionFragment,
} from "gql/generated/types";
import { WATERFALL } from "gql/queries";
import { useUserTimeZone } from "hooks";
import { useDimensions } from "hooks/useDimensions";
import { useQueryParam, useQueryParams } from "hooks/useQueryParam";
import { getObject, setObject } from "utils/localStorage";
import { BuildRow } from "./BuildRow";
import { VERSION_LIMIT } from "./constants";
import { FetchingMore } from "./FetchingMore";
import { InactiveVersionsButton } from "./InactiveVersions";
import {
  BuildVariantTitle,
  gridGroupCss,
  InactiveVersion,
  Row,
} from "./styles";
import { WaterfallFilterOptions } from "./types";
import { useFilters } from "./useFilters";
import { useWaterfallTrace } from "./useWaterfallTrace";
import { VersionLabel, VersionLabelView } from "./VersionLabel";

type WaterfallGridProps = {
  projectIdentifier: string;
  setPagination: (pagination: WaterfallPagination) => void;
};

export const WaterfallGrid: React.FC<WaterfallGridProps> = ({
  projectIdentifier,
  setPagination,
}) => {
  useWaterfallTrace();

  const [pins, setPins] = useState<string[]>(
    getObject(WATERFALL_PINNED_VARIANTS_KEY)?.[projectIdentifier] ?? [],
  );

  const handlePinBV = useCallback(
    (buildVariant: string) => () => {
      setPins((prev: string[]) => {
        const bvIndex = prev.indexOf(buildVariant);
        if (bvIndex > -1) {
          const removed = [...prev];
          removed.splice(bvIndex, 1);
          return removed;
        }
        return [...prev, buildVariant];
      });
    },
    [],
  );

  useEffect(() => {
    const bvs = getObject(WATERFALL_PINNED_VARIANTS_KEY);
    setObject(WATERFALL_PINNED_VARIANTS_KEY, {
      ...bvs,
      [projectIdentifier]: pins,
    });
  }, [pins, projectIdentifier]);

  const [limit, setLimit] = useState(VERSION_LIMIT);
  const [maxOrder] = useQueryParam<number>(WaterfallFilterOptions.MaxOrder, 0);
  const [minOrder] = useQueryParam<number>(WaterfallFilterOptions.MinOrder, 0);
  const [revision] = useQueryParam<string | null>(
    WaterfallFilterOptions.Revision,
    null,
  );
  const [date] = useQueryParam<string>(WaterfallFilterOptions.Date, "");

  const timezone = useUserTimeZone() ?? utcTimeZone;

  const [serverFilters, setServerFilters] = useState<{
    requesters: string[];
    variants: string[];
  }>({ requesters: [], variants: [] });

  const { data } = useSuspenseQuery<WaterfallQuery, WaterfallQueryVariables>(
    WATERFALL,
    {
      variables: {
        options: {
          projectIdentifier,
          date: date ? fromZonedTime(date, timezone) : undefined,
          limit,
          maxOrder,
          minOrder,
          requesters: serverFilters.requesters,
          revision,
          variants: serverFilters.variants,
        },
      },
      // @ts-expect-error pollInterval isn't officially supported by useSuspenseQuery, but it works so let's use it anyway.
      pollInterval: DEFAULT_POLL_INTERVAL,
    },
  );

  useEffect(() => {
    setPagination(data.waterfall.pagination);
  }, [setPagination, data.waterfall.pagination]);

  const refEl = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(
    refEl as React.MutableRefObject<HTMLElement>,
  );

  const { activeVersionIds, buildVariants, versions } = useFilters({
    buildVariants: data.waterfall.buildVariants,
    flattenedVersions: data.waterfall.flattenedVersions,
    limit,
    pins,
  });

  const lastActiveVersionId = activeVersionIds[activeVersionIds.length - 1];

  const [requesters] = useQueryParam<string[]>(
    WaterfallFilterOptions.Requesters,
    [],
  );
  const [variants] = useQueryParam<string[]>(
    WaterfallFilterOptions.BuildVariant,
    [],
  );

  const [queryParams] = useQueryParams();
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!Object.keys(queryParams).length) {
      startTransition(() => {
        setLimit(5);
        setServerFilters({
          requesters: [],
          variants: [],
        });
      });
    } else if (activeVersionIds.length <= 1) {
      startTransition(() => {
        setServerFilters({
          requesters,
          variants,
        });
      });
    } else if (activeVersionIds.length < 5) {
      startTransition(() => {
        setLimit(15);
      });
    }
  }, [queryParams]);

  const isHighlighted = (v: WaterfallVersionFragment, i: number) =>
    (revision !== null && v.revision.includes(revision)) || (!!date && i === 0);

  return (
    <Container ref={refEl}>
      <Row>
        <BuildVariantTitle />
        <Versions data-cy="version-labels">
          {versions.map(({ inactiveVersions, version }, versionIndex) => {
            if (version) {
              return (
                <VersionLabel
                  highlighted={isHighlighted(version, versionIndex)}
                  view={VersionLabelView.Waterfall}
                  {...version}
                  key={version.id}
                />
              );
            }
            const highlightedIndex = inactiveVersions?.findIndex(
              (inactiveVersion, i) => isHighlighted(inactiveVersion, i),
            );
            return (
              <InactiveVersion key={inactiveVersions?.[0].id}>
                <InactiveVersionsButton
                  containerHeight={height}
                  highlightedIndex={
                    highlightedIndex !== undefined && highlightedIndex > -1
                      ? highlightedIndex
                      : undefined
                  }
                  versions={inactiveVersions ?? []}
                />
              </InactiveVersion>
            );
          })}
          {isPending && <FetchingMore />}
        </Versions>
      </Row>
      {buildVariants.map((b) => (
        <BuildRow
          key={b.id}
          build={b}
          handlePinClick={handlePinBV(b.id)}
          lastActiveVersionId={lastActiveVersionId}
          pinned={pins.includes(b.id)}
          projectIdentifier={projectIdentifier}
          versions={versions}
        />
      ))}
    </Container>
  );
};

const Container = styled.div``;

const Versions = styled.div`
  ${gridGroupCss}
`;
