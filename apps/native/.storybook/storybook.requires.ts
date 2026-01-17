/* eslint-disable @typescript-eslint/ban-ts-comment */
import { start } from "@storybook/react-native";

import "@storybook/addon-ondevice-controls/register";
import "@storybook/addon-ondevice-actions/register";

const normalizedStories = [
	{
		titlePrefix: "",
		directory: "../components",
		files: "**/*.stories.?(ts|tsx|js|jsx)",
		importPathMatcher: /^\.\/*.+\.stories\.(?:ts|tsx|js|jsx)$/,
		// @ts-expect-error - require.context provided by Storybook.
		req: require.context("../components", true, /\.stories\.(ts|tsx|js|jsx)$/),
	},
];

// @ts-expect-error - Storybook reads this global.
global.STORIES = normalizedStories;

export const view = start({
	annotations: [
		require("./preview"),
		require("@storybook/react-native/dist/preview"),
		require("@storybook/addon-actions/preview"),
	],
	storyEntries: normalizedStories,
});
