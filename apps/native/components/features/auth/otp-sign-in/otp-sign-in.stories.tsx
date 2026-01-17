import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { OtpSignIn } from "./otp-sign-in";

const meta = {
	title: "Auth/OtpSignIn",
	component: OtpSignIn,
} satisfies Meta<typeof OtpSignIn>;

export default meta;

type Story = StoryObj<typeof OtpSignIn>;

export const Default: Story = {
	render: () => (
		<View className="flex-1 bg-background p-6">
			<OtpSignIn />
		</View>
	),
};
