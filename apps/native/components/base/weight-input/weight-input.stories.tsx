import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { WeightInput } from "./weight-input";

const meta = {
	title: "Base/WeightInput",
	component: WeightInput,
} satisfies Meta<typeof WeightInput>;

export default meta;

type Story = StoryObj<typeof WeightInput>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState(68);
		const [unit, setUnit] = React.useState<"kg" | "lbs">("kg");

		return (
			<View className="bg-background flex-1 p-6">
				<WeightInput
					label="Weight (kg)"
					valueLabel={`${value} ${unit}`}
					pickerValue={value}
					pickerUnit={unit}
					onPickerChange={(nextValue, nextUnit) => {
						setUnit(nextUnit);
						setValue(nextValue);
					}}
					onConfirm={() => {}}
				/>
			</View>
		);
	},
};
