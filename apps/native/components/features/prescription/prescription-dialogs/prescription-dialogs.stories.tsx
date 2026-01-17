import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

import { ManualPrescriptionDialog } from "./prescription-dialogs";

const meta = {
	title: "Prescription/ManualPrescriptionDialog",
	component: ManualPrescriptionDialog,
} satisfies Meta<typeof ManualPrescriptionDialog>;

export default meta;

type Story = StoryObj<typeof ManualPrescriptionDialog>;

export const Placeholder: Story = {
	render: () => (
		<View className="flex-1 items-center justify-center bg-background p-6">
			<Text className="text-muted text-sm">
				Dialogs require an authenticated session to render forms.
			</Text>
		</View>
	),
};
