import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

const meta = {
	title: "Welcome",
	component: View,
} satisfies Meta<typeof View>;

export default meta;

export const GettingStarted: StoryObj<typeof View> = {
	render: () => (
		<View className="flex-1 items-center justify-center bg-background p-6">
			<Text className="font-semibold text-foreground text-lg">
				Storybook is ready
			</Text>
			<Text className="mt-2 text-center text-muted-foreground text-sm">
				Test
			</Text>
		</View>
	),
};
