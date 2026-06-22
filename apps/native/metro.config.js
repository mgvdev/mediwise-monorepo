const path = require("node:path");
const {
	withStorybook,
} = require("@storybook/react-native/metro/withStorybook");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.unstable_allowRequireContext = true;

const uniwindConfig = withUniwindConfig(config, {
	cssEntryFile: "./global.css",
	dtsFile: "./uniwind-types.d.ts",
});

module.exports = withStorybook(uniwindConfig, {
	enabled: process.env.EXPO_PUBLIC_STORYBOOK === "1",
	configPath: path.resolve(__dirname, "./.rnstorybook"),
});
