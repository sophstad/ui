import { memo, useState } from "react";
import { useSuspenseQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { palette } from "@leafygreen-ui/palette";
import { SearchInput } from "@leafygreen-ui/search-input";
import { Link, useParams } from "react-router-dom";
import { TaskStatus } from "@evg-ui/lib/types/task";
import { getTaskRoute, slugs } from "constants/routes";
import {
  WaterfallBuild,
  WaterfallBuildVariant,
  WaterfallQuery,
  WaterfallQueryVariables,
} from "gql/generated/types";
import { WATERFALL } from "gql/queries";
import { VersionLabel } from "./VersionLabel";

const { black, gray, green, red, white } = palette;

const LIMIT = 5;

export const WaterfallGrid: React.FC = () => {
  const { [slugs.projectIdentifier]: projectIdentifier } = useParams();
  const [taskFilter, setTaskFilter] = useState("");
  const [bvFilter, setBvFilter] = useState("");

  const { data } = useSuspenseQuery<WaterfallQuery, WaterfallQueryVariables>(
    WATERFALL,
    {
      skip: !projectIdentifier,
      variables: {
        options: {
          // @ts-expect-error
          projectIdentifier,
          limit: LIMIT,
        },
      },
    },
  );

  const activeVersionIds = data.waterfall.versions.reduce(
    (acc, { version }) => {
      if (version) {
        acc.push(version.id);
      }
      return acc;
    },
    [] as string[],
  );

  return (
    <>
      <SearchInput
        aria-label="Build variant filter"
        onSubmit={(e) => {
          const { value } = (
            e.target as HTMLFormElement
          )[0] as HTMLInputElement;
          setBvFilter(value);
        }}
        placeholder="Build variant filter"
      />
      <SearchInput
        aria-label="Task filter"
        onSubmit={(e) => {
          const { value } = (
            e.target as HTMLFormElement
          )[0] as HTMLInputElement;
          setTaskFilter(value);
        }}
        placeholder="Task filter"
      />
      <Container>
        <Row>
          <div />
          {data.waterfall.versions.map(({ version }) =>
            version ? <VersionLabel key={version.id} {...version} /> : null,
          )}
        </Row>
        {data.waterfall.buildVariants.map((b) =>
          !bvFilter ||
          b.id.toLowerCase().includes(bvFilter.toLowerCase()) ||
          b.displayName.toLowerCase().includes(bvFilter.toLowerCase()) ? (
            <BuildRow
              key={b.id}
              activeVersionIds={activeVersionIds}
              build={b}
              taskFilter={taskFilter}
            />
          ) : null,
        )}
      </Container>
    </>
  );
};

const BuildRow: React.FC<{
  activeVersionIds: string[];
  build: WaterfallBuildVariant;
  taskFilter: string;
}> = ({ activeVersionIds, build, taskFilter }) => {
  const { builds, displayName } = build;
  let buildIndex = 0;
  return (
    <Row>
      <BuildVariantTitle>{displayName}</BuildVariantTitle>
      {activeVersionIds.map((id) => {
        if (id === builds[buildIndex].version) {
          const b = builds[buildIndex];
          buildIndex += 1;
          return <BuildGrid key={b.id} build={b} taskFilter={taskFilter} />;
        }
        return <Build />;
      })}
    </Row>
  );
};

const BuildGrid: React.FC<{
  build: WaterfallBuild;
  taskFilter: string;
}> = ({ build, taskFilter }) => {
  const tasks = taskFilter.length
    ? build.tasks.filter(({ displayName }) => displayName.includes(taskFilter))
    : build.tasks;

  if (!tasks.length) {
    return <Build />;
  }

  return (
    <Build>
      {tasks.map(({ displayName, id, status }) => (
        <SquareMemo
          key={id}
          data-tooltip={displayName}
          status={status}
          to={getTaskRoute(id)}
        />
      ))}
    </Build>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(${LIMIT + 1}, minmax(0, 1fr));
`;

const Row = styled.div`
  display: grid;
  grid-column: 1/-1;
  grid-template-columns: subgrid;

  line-offset: 2px;
  line-thickness: 4px;
  line-color: black;

  > div {
    padding: 8px;
    margin: 8px 0;
  }

  > :only-child {
    display: none;
  }
`;

const BuildVariantTitle = styled.div`
  word-break: break-word;
`;

const borderStyle = `1px solid ${gray.light2}`;

const Build = styled.div`
  border-top: ${borderStyle};
  border-bottom: ${borderStyle};
  margin: 2px;

  &:nth-child(2) {
    border-left: ${borderStyle};
    border-radius: 8px 0 0 8px;
  }

  &:last-child {
    border-right: ${borderStyle};
    border-radius: 0 8px 8px 0;
  }
`;

const Square = styled(Link)<{ status: string }>`
  width: 15px;
  height: 15px;
  border: 1px solid ${white};
  box-sizing: content-box;
  float: left;
  cursor: pointer;
  position: relative;

  ${({ status }) =>
    status === TaskStatus.Succeeded
      ? `background-color: ${green.dark1};`
      : `background-color: ${red.base};
background-image: url("/static/img/waterfall/X.svg");
  `}

  :before {
    content: attr(data-tooltip);
    position: absolute;

    bottom: calc(100% + 5px);
    left: 50%;
    transform: translate(-50%);
    z-index: 1;

    width: max-content;
    max-width: 450px;
    overflow-wrap: break-word;
    padding: 10px;
    border-radius: 5px;
    background: ${black};
    color: ${white};
    text-align: center;

    display: none;
  }

  :hover:before {
    display: block;
  }

  /* Tooltip caret */
  :hover:after {
    content: "";
    position: absolute;
    bottom: calc(100% - 5px);
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${black} transparent transparent transparent;
  }
`;

const SquareMemo = memo(Square);
