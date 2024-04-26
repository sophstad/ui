import type { StorybookConfig } from "@storybook/react-vite";

export { addons, docs, previewHead, stories } from "./main";

export { default as projectAnnotations } from "./preview";

export const previewAnnotations: StorybookConfig["previewAnnotations"] = [
  require.resolve("./preview"),
];
