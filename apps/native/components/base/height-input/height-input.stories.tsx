import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { HeightInput } from "./height-input";

const meta = {
	title: "Base/HeightInput",
	component: HeightInput,
} satisfies Meta<typeof HeightInput>;

export default meta;

type Story = StoryObj<typeof HeightInput>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState(170);
		const [unit, setUnit] = React.useState<"cm" | "inch">("cm");

		return (
			<View className="flex-1 bg-background p-6">
				<HeightInput
					label="Height (cm)"
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
