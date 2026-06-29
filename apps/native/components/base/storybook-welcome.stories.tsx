import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

const meta = {
	title: "Welcome",
	component: View,
} satisfies Meta<typeof View>;

export default meta;

export const GettingStarted: StoryObj<typeof View> = {
	render: () => (
		<View className="bg-background flex-1 items-center justify-center p-6">
			<Text className="text-foreground text-lg font-semibold">
				Storybook is ready
			</Text>
			<Text className="text-muted-foreground mt-2 text-center text-sm">
				Test
			</Text>
		</View>
	),
};
