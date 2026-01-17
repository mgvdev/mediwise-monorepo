import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { ProfileActionRow } from "./profile-action-row";

const meta = {
	title: "Profile/ProfileActionRow",
	component: ProfileActionRow,
} satisfies Meta<typeof ProfileActionRow>;

export default meta;

type Story = StoryObj<typeof ProfileActionRow>;

export const Default: Story = {
	render: () => (
		<View className="flex-1 bg-background p-6">
			<ProfileActionRow
				label="Allergies"
				value="Penicillin"
				onPress={() => undefined}
			/>
		</View>
	),
};
