import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { ThemeToggle } from "./theme-toggle";

const meta = {
	title: "Theme/ThemeToggle",
	component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
	render: () => (
		<AppThemeProvider>
			<View className="flex-1 items-center justify-center bg-background">
				<ThemeToggle />
			</View>
		</AppThemeProvider>
	),
};
