import { useReadQuery, useQueryRefHandlers } from "@apollo/client/react";
import styled from "@emotion/styled";
import { Button } from "@leafygreen-ui/button";
import Icon from "@evg-ui/lib/components/Icon";
import { size } from "@evg-ui/lib/constants/tokens";
import { useQueryParam, useQueryParams } from "@evg-ui/lib/hooks";
import { useWaterfallAnalytics } from "analytics";
import { VERSION_LIMIT } from "../constants";
import { Pagination, WaterfallFilterOptions } from "../types";

interface PaginationButtonsProps {
  omitInactiveBuilds: boolean;
  pagination: Pagination | undefined;
  projectIdentifier: string;
  queryRef: any;
}

export const PaginationButtons: React.FC<PaginationButtonsProps> = ({
  omitInactiveBuilds,
  projectIdentifier,
  queryRef,
}) => {
  const { sendEvent } = useWaterfallAnalytics();
  const [queryParams, setQueryParams] = useQueryParams();
  const { fetchMore } = useQueryRefHandlers(queryRef);
  const { data } = useReadQuery(queryRef);
  console.log(data);

  const { hasNextPage, hasPrevPage, nextPageOrder, prevPageOrder } =
    data?.waterfall.pagination ?? {};

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

  const baseOptions = {
    projectIdentifier,
    limit: VERSION_LIMIT,
    omitInactiveBuilds,
    requesters,
    statuses,
    tasks,
    variants,
  };

  const onNextClick = () => {
    sendEvent({ name: "Changed page", direction: "next" });
    setQueryParams({
      ...queryParams,
      [WaterfallFilterOptions.Date]: undefined,
      [WaterfallFilterOptions.MaxOrder]: nextPageOrder,
      [WaterfallFilterOptions.MinOrder]: undefined,
      [WaterfallFilterOptions.Revision]: undefined,
    });
    fetchMore({
      variables: {
        options: {
          ...baseOptions,
          maxOrder: nextPageOrder,
        },
      },
    });
  };

  const onPrevClick = () => {
    sendEvent({
      name: "Changed page",
      direction: "previous",
    });
    setQueryParams({
      ...queryParams,
      [WaterfallFilterOptions.Date]: undefined,
      [WaterfallFilterOptions.MaxOrder]: undefined,
      [WaterfallFilterOptions.MinOrder]: prevPageOrder,
      [WaterfallFilterOptions.Revision]: undefined,
    });
    fetchMore({
      variables: {
        options: {
          ...baseOptions,
          minOrder: prevPageOrder,
        },
      },
    });
  };

  return (
    <ButtonContainer>
      <Button
        data-cy="prev-page-button"
        disabled={!hasPrevPage}
        leftGlyph={<Icon glyph="ChevronLeft" />}
        onClick={onPrevClick}
      />
      <Button
        data-cy="next-page-button"
        disabled={!hasNextPage}
        leftGlyph={<Icon glyph="ChevronRight" />}
        onClick={onNextClick}
      />
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  gap: ${size.xs};
`;
