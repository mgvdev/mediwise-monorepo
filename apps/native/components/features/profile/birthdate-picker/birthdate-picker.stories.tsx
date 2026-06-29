import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { BirthdatePicker } from "./birthdate-picker";

const meta = {
	title: "Profile/BirthdatePicker",
	component: BirthdatePicker,
} satisfies Meta<typeof BirthdatePicker>;

export default meta;

type Story = StoryObj<typeof BirthdatePicker>;

export const Default: Story = {
	render: () => {
		const [birthDate, setBirthDate] = React.useState<string | null>(null);

		return (
			<View className="bg-background flex-1 p-6">
				<BirthdatePicker value={birthDate} onChange={setBirthDate} />
			</View>
		);
	},
};
