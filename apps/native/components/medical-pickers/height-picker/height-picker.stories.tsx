import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { HeightPicker } from "./height-picker";

const meta = {
	title: "Profile/HeightPicker",
	component: HeightPicker,
} satisfies Meta<typeof HeightPicker>;

export default meta;

type Story = StoryObj<typeof HeightPicker>;

export const Centimeters: Story = {
	render: () => {
		const [unit, setUnit] = React.useState<"cm" | "inch">("cm");
		const [value, setValue] = React.useState(172);

		return (
			<View className="bg-background flex-1 p-6">
				<HeightPicker
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

export const Inches: Story = {
	render: () => {
		const [unit, setUnit] = React.useState<"cm" | "inch">("inch");
		const [value, setValue] = React.useState(68);

		return (
			<View className="bg-background flex-1 p-6">
				<HeightPicker
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
