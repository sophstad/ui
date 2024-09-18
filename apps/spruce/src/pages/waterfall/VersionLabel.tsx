import styled from "@emotion/styled";
import { InlineCode } from "@leafygreen-ui/typography";
import { Link } from "react-router-dom";
import { Unpacked } from "@evg-ui/lib/types/utils";
import { getVersionRoute } from "constants/routes";
import { WaterfallQuery } from "gql/generated/types";
import { useSpruceConfig, useDateFormat } from "hooks";
import { shortenGithash } from "utils/string";
import { jiraLinkify } from "utils/string/jiraLinkify";

type VersionFields = NonNullable<
  Unpacked<WaterfallQuery["waterfall"]["versions"]>["version"]
>;

export const VersionLabel: React.FC<VersionFields> = ({
  author,
  createTime,
  id,
  message,
  revision,
}) => {
  const getDateCopy = useDateFormat();
  const createDate = new Date(createTime);

  const spruceConfig = useSpruceConfig();
  const jiraHost = spruceConfig?.jira?.host;
  return (
    <VersionContainer>
      <div>
        <InlineCode as={Link} to={getVersionRoute(id)}>
          {shortenGithash(revision)}
        </InlineCode>{" "}
        {getDateCopy(createDate, { omitSeconds: true, omitTimezone: true })}
      </div>
      <CommitMessage title={message}>
        <strong>{author}</strong> -{" "}
        {jiraLinkify(
          message,
          // @ts-expect-error: FIXME. This comment was added by an automated script.
          jiraHost,
        )}
      </CommitMessage>
    </VersionContainer>
  );
};

const VersionContainer = styled.div`
  background-color: white;
  font-size: 12px;
`;

const CommitMessage = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  margin: 0;
  overflow: hidden;
`;
