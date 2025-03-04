import styled from "@emotion/styled";
import { palette } from "@leafygreen-ui/palette";
import { RadioGroup, Radio } from "@leafygreen-ui/radio-group";
import { size } from "@evg-ui/lib/constants/tokens";
import { useProjectHealthAnalytics } from "analytics/projectHealth/useProjectHealthAnalytics";
import { Accordion } from "components/Accordion";
import { ChartTypes } from "types/commits";

const { gray, white } = palette;

export const ChartToggle: React.FC<{
  onToggleAccordion: (nextState: { isVisible: boolean }) => void;
  defaultOpenAccordion: boolean;
  currentChartType: ChartTypes;
  onChangeChartType: (chartType: ChartTypes) => void;
}> = ({
  currentChartType,
  defaultOpenAccordion,
  onChangeChartType,
  onToggleAccordion,
}) => {
  const { sendEvent } = useProjectHealthAnalytics({ page: "Commit chart" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chartType = e.target.value as ChartTypes;
    onChangeChartType(chartType);
    sendEvent({
      name: "Toggled chart view option",
      "view.option": chartType,
    });
  };
  return (
    <StyledAccordion
      defaultOpen={defaultOpenAccordion}
      onToggle={onToggleAccordion}
      title="View options"
    >
      <ToggleWrapper>
        <StyledRadioGroup
          name="chart-select"
          onChange={onChange}
          value={currentChartType}
        >
          <Radio
            data-cy="cy-chart-absolute-radio"
            id="chart-radio-absolute"
            value={ChartTypes.Absolute}
          >
            Absolute Number
          </Radio>
          <Radio
            data-cy="cy-chart-percent-radio"
            id="chart-radio-percent"
            value={ChartTypes.Percentage}
          >
            Percentage
          </Radio>
        </StyledRadioGroup>
      </ToggleWrapper>
    </StyledAccordion>
  );
};

const StyledRadioGroup = styled(RadioGroup)`
  display: flex;
  flex-direction: row;
  gap: ${size.xs};
  margin: ${size.xs} 0;
`;

const ToggleWrapper = styled.div`
  padding: ${size.xxs} ${size.xs};
  border-radius: ${size.xs};
  border: 1px solid ${gray.light2};
  background: ${white};
  box-shadow: 0px ${size.xxs} ${size.xs} -${size.xxs} rgba(0, 0, 0, 0.3);
`;

const StyledAccordion = styled(Accordion)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
