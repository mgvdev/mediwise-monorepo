import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { LogoutButton } from "./logout-button";

const meta = {
	title: "Base/LogoutButton",
	component: LogoutButton,
} satisfies Meta<typeof LogoutButton>;

export default meta;

type Story = StoryObj<typeof LogoutButton>;

export const Default: Story = {
	render: () => (
		<View className="flex-1 bg-background p-6">
			<LogoutButton onPress={() => {}} />
		</View>
	),
};
