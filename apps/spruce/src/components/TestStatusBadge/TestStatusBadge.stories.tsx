import Styled from "@emotion/styled";
import { TestStatus } from "@evg-ui/lib/types/test";
import { size } from "constants/tokens";
import { CustomMeta, CustomStoryObj } from "test_utils/types";
import TestStatusBadge from ".";

export default {
  component: TestStatusBadge,
} satisfies CustomMeta<typeof TestStatusBadge>;

export const Default: CustomStoryObj<typeof TestStatusBadge> = {
  render: (args) => (
    <Container>
      {Object.values(TestStatus).map((status) => (
        <TestStatusBadge {...args} key={status} status={status} />
      ))}
    </Container>
  ),
  argTypes: {},
  args: {},
};

const Container = Styled.div`
    display: flex;
    gap: ${size.s};
`;
