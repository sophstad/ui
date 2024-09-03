import { useSuspenseQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { palette } from "@leafygreen-ui/palette";
import { Link, useParams } from "react-router-dom";
import { TaskStatus } from "@evg-ui/lib/types/task";
import { getTaskRoute, slugs } from "constants/routes";
import { WaterfallQuery, WaterfallQueryVariables } from "gql/generated/types";
import { WATERFALL } from "gql/queries";

const { black, green, red, white } = palette;
const LIMIT = 5;

export const WaterfallGrid: React.FC = () => {
  const { [slugs.projectIdentifier]: projectIdentifier } = useParams();

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

  console.log(data);
  return (
    <>
      {/* @ts-expect-error */}
      {data.waterfall.buildVariants.map(({ builds, displayName }) => (
        <BuildVariant>
          <Build>
            <BuildVariantTitle>{displayName}</BuildVariantTitle>
            {Object.entries(builds).map(([, { tasks }]) => (
              <Version>
                {tasks?.map(({ displayName: taskName, id, status }) => (
                  <Square
                    data-tooltip={taskName}
                    status={status}
                    to={getTaskRoute(id)}
                  />
                ))}
              </Version>
            ))}
          </Build>
        </BuildVariant>
      ))}
    </>
  );
};

const BuildVariant = styled.div`
  box-sizing: border-box;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-gap: 0;
  width: 100%;
`;

const Build = styled.div`
  display: grid;
  grid-template-columns: repeat(${LIMIT + 1}, 1fr);
  grid-template-rows: subgrid;
  gap: 12px;
  padding: 12px;
`;

const BuildVariantTitle = styled.div`
  word-break: break-word;
`;

const Version = styled.div``;

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

    width: fit-content;
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
