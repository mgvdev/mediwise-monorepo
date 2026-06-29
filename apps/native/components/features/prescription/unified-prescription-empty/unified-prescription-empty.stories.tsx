import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { UnifiedPrescriptionEmpty } from "./unified-prescription-empty";

const meta = {
	title: "Prescription/UnifiedPrescriptionEmpty",
	component: UnifiedPrescriptionEmpty,
} satisfies Meta<typeof UnifiedPrescriptionEmpty>;

export default meta;

type Story = StoryObj<typeof UnifiedPrescriptionEmpty>;

export const Default: Story = {
	render: () => (
		<View className="bg-background flex-1 p-6">
			<UnifiedPrescriptionEmpty />
		</View>
	),
};
