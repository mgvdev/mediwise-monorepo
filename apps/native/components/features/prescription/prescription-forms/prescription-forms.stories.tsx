import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

import { ManualPrescriptionForm } from "./prescription-forms";

const meta = {
	title: "Prescription/ManualPrescriptionForm",
	component: ManualPrescriptionForm,
} satisfies Meta<typeof ManualPrescriptionForm>;

export default meta;

type Story = StoryObj<typeof ManualPrescriptionForm>;

export const Placeholder: Story = {
	render: () => (
		<View className="flex-1 items-center justify-center bg-background p-6">
			<Text className="text-muted text-sm">
				ManualPrescriptionForm requires an authenticated session.
			</Text>
		</View>
	),
};
