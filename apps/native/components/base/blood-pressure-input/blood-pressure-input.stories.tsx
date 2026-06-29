import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { BloodPressureInput } from "./blood-pressure-input";

const meta = {
	title: "Base/BloodPressureInput",
	component: BloodPressureInput,
} satisfies Meta<typeof BloodPressureInput>;

export default meta;

type Story = StoryObj<typeof BloodPressureInput>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState<string | null>(null);

		return (
			<View className="bg-background flex-1 p-6">
				<BloodPressureInput value={value} onChange={setValue} />
			</View>
		);
	},
};

export const Prefilled: Story = {
	render: () => {
		const [value, setValue] = React.useState<string | null>("120/80");

		return (
			<View className="bg-background flex-1 p-6">
				<BloodPressureInput value={value} onChange={setValue} />
			</View>
		);
	},
};

export const WithHelperText: Story = {
	render: () => {
		const [value, setValue] = React.useState<string | null>(null);

		return (
			<View className="bg-background flex-1 p-6">
				<BloodPressureInput
					value={value}
					onChange={setValue}
					helperText="Systolic over diastolic, e.g. 120/80."
				/>
			</View>
		);
	},
};
