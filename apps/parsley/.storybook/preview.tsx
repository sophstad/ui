import { Decorator } from "@storybook/react";
import { GlobalStyles } from "../src/components/styles";
import { LogContextProvider } from "../src/context/LogContext";

export const decorators: Decorator[] = [
  (Story) => (
    <>
      <GlobalStyles />
      <Story />
    </>
  ),
  (Story) => (
    <LogContextProvider>
      <Story />
    </LogContextProvider>
  ),
];
