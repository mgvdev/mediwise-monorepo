import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { BloodPressurePicker } from "./blood-pressure-picker";

const meta = {
	title: "Profile/BloodPressurePicker",
	component: BloodPressurePicker,
} satisfies Meta<typeof BloodPressurePicker>;

export default meta;

type Story = StoryObj<typeof BloodPressurePicker>;

export const Normal: Story = {
	render: () => {
		const [systolic, setSystolic] = React.useState(118);
		const [diastolic, setDiastolic] = React.useState(76);

		return (
			<View className="bg-background flex-1 p-6">
				<BloodPressurePicker
					systolic={systolic}
					diastolic={diastolic}
					onChange={(nextSys, nextDia) => {
						setSystolic(nextSys);
						setDiastolic(nextDia);
					}}
				/>
			</View>
		);
	},
};

export const Hypertension: Story = {
	render: () => {
		const [systolic, setSystolic] = React.useState(150);
		const [diastolic, setDiastolic] = React.useState(95);

		return (
			<View className="bg-background flex-1 p-6">
				<BloodPressurePicker
					systolic={systolic}
					diastolic={diastolic}
					onChange={(nextSys, nextDia) => {
						setSystolic(nextSys);
						setDiastolic(nextDia);
					}}
				/>
			</View>
		);
	},
};
