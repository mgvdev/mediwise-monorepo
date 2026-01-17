import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { NativeDatePicker } from "./native-date-picker";

const meta = {
	title: "Profile/NativeDatePicker",
	component: NativeDatePicker,
} satisfies Meta<typeof NativeDatePicker>;

export default meta;

type Story = StoryObj<typeof NativeDatePicker>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState("1990-01-01");

		return (
			<View className="flex-1 bg-background p-6">
				<NativeDatePicker value={value} onChange={setValue} />
			</View>
		);
	},
};
