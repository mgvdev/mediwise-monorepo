import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

import { AuthGate } from "./auth-gate";

const meta = {
	title: "Auth/AuthGate",
	component: AuthGate,
} satisfies Meta<typeof AuthGate>;

export default meta;

type Story = StoryObj<typeof AuthGate>;

export const Placeholder: Story = {
	render: () => (
		<View className="bg-background flex-1 items-center justify-center p-6">
			<Text className="text-foreground text-sm">AuthGate is router-bound.</Text>
			<Text className="text-muted mt-2 text-xs">
				Use it inside the app navigation tree.
			</Text>
		</View>
	),
};
