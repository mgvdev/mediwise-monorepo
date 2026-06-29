import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { WeightPicker } from "./weight-picker";

const meta = {
	title: "Profile/WeightPicker",
	component: WeightPicker,
} satisfies Meta<typeof WeightPicker>;

export default meta;

type Story = StoryObj<typeof WeightPicker>;

export const Kilograms: Story = {
	render: () => {
		const [unit, setUnit] = React.useState<"kg" | "lbs">("kg");
		const [value, setValue] = React.useState(72);

		return (
			<View className="bg-background flex-1 p-6">
				<WeightPicker
					unit={unit}
					value={value}
					onChange={(nextValue, nextUnit) => {
						setUnit(nextUnit);
						setValue(nextValue);
					}}
				/>
			</View>
		);
	},
};

export const Pounds: Story = {
	render: () => {
		const [unit, setUnit] = React.useState<"kg" | "lbs">("lbs");
		const [value, setValue] = React.useState(165);

		return (
			<View className="bg-background flex-1 p-6">
				<WeightPicker
					unit={unit}
					value={value}
					onChange={(nextValue, nextUnit) => {
						setUnit(nextUnit);
						setValue(nextValue);
					}}
				/>
			</View>
		);
	},
};
