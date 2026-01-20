import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { View } from "react-native";

import { InputOtp } from "./input-otp";

const meta = {
	title: "Base/InputOtp",
	component: InputOtp,
} satisfies Meta<typeof InputOtp>;

export default meta;

type Story = StoryObj<typeof InputOtp>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState("");
		return (
			<View className="bg-background p-6">
				<InputOtp value={value} onChange={setValue} />
			</View>
		);
	},
};
