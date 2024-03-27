import { css } from "@emotion/react";
import widgets from "components/SpruceForm/Widgets";

interface GetNoExpirationCheckboxTooltipCopyProps {
  disableExpirationCheckbox: boolean;
  isVolume: boolean;
  limit: number;
}
export const getNoExpirationCheckboxTooltipCopy = ({
  disableExpirationCheckbox,
  isVolume,
  limit,
}: GetNoExpirationCheckboxTooltipCopyProps) =>
  disableExpirationCheckbox
    ? `You have reached the max number of unexpirable ${
        isVolume ? "volumes" : "hosts"
      }  (${limit}). Toggle an existing ${
        isVolume ? "volume" : "host"
      } to expirable to enable this checkbox.`
    : undefined;

export const getDefaultExpiration = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toString();
};

type HostUptimeProps = {
  runContinuously: boolean;
};

export const getHostUptimeSchema = ({ runContinuously }: HostUptimeProps) => ({
  schema: {
    type: "object" as "object",
    title: "Expiration Details",
    properties: {
      useDefault: {
        type: "boolean" as "boolean",
        title: "Use default host uptime schedule (M-F, 8am-8pm)",
      },
      sleepSchedule: {
        type: "object" as "object",
        properties: {
          enabledWeekdays: {
            type: "array" as "array",
            default: [false, true, true, true, true, true, false],
            items: {
              type: "number" as "number",
            },
          },
          timeSelection: {
            type: "object" as "object",
            properties: {
              startTime: {
                type: "string" as "string",
                title: "Start Time",
              },
              endTime: {
                type: "string" as "string",
                title: "End Time",
              },
              runContinuously: {
                type: "boolean" as "boolean",
                title: "Run host continuously for enabled days",
              },
            },
          },
        },
      },
    },
  },
  uiSchema: {
    sleepSchedule: {
      enabledWeekdays: {
        "ui:addable": false,
        "ui:widget": widgets.DayPickerWidget,
      },
      timeSelection: {
        "ui:elementWrapperCSS": datePickerCSS,
        startTime: {
          "ui:disabled": runContinuously,
          "ui:format": "HH:mm",
          "ui:widget": widgets.TimeWidget,
          "ui:elementWrapperCSS": css`
            width: fit-content;
          `,
        },
        endTime: {
          "ui:disabled": runContinuously,
          "ui:format": "HH:mm",
          "ui:widget": widgets.TimeWidget,
        },
      },
    },
  },
});

const datePickerCSS = css`
  display: flex;
  z-index: 1;
`;
