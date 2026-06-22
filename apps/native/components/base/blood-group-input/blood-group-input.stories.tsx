import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { BloodGroupInput } from "./blood-group-input";

const meta = {
	title: "Base/BloodGroupInput",
	component: BloodGroupInput,
} satisfies Meta<typeof BloodGroupInput>;

export default meta;

type Story = StoryObj<typeof BloodGroupInput>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState<string | null>(null);

		return (
			<View className="flex-1 bg-background p-6">
				<BloodGroupInput value={value} onChange={setValue} />
			</View>
		);
	},
};
