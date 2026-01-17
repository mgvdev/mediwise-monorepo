import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { DotChip } from "./dot-chip";

const meta = {
	title: "Base/DotChip",
	component: DotChip,
} satisfies Meta<typeof DotChip>;

export default meta;

type Story = StoryObj<typeof DotChip>;

export const States: Story = {
	render: () => (
		<View className="flex-1 gap-3 bg-background p-6">
			<DotChip status="normal" label="Normal" />
			<DotChip status="warning" label="Warning" />
			<DotChip status="danger" label="Danger" />
		</View>
	),
};
