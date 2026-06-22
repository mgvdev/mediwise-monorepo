import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "heroui-native";
import { View } from "react-native";

import { RollingNumber } from "./rolling-number";

const meta = {
	title: "Base/RollingNumber",
	component: RollingNumber,
} satisfies Meta<typeof RollingNumber>;

export default meta;

type Story = StoryObj<typeof RollingNumber>;

export const Interactive: Story = {
	render: () => {
		const [value, setValue] = React.useState(120);

		return (
			<View className="flex-1 items-center justify-center gap-8 bg-background p-6">
				<RollingNumber value={value} />
				<View className="flex-row gap-2">
					<Button variant="secondary" onPress={() => setValue((v) => v - 1)}>
						<Button.Label>-1</Button.Label>
					</Button>
					<Button variant="secondary" onPress={() => setValue((v) => v + 1)}>
						<Button.Label>+1</Button.Label>
					</Button>
					<Button onPress={() => setValue((v) => v + 25)}>
						<Button.Label>+25</Button.Label>
					</Button>
				</View>
			</View>
		);
	},
};

// Auto-scrolling demo to preview the wheel-style rolling animation.
export const AutoScroll: Story = {
	render: () => {
		const [value, setValue] = React.useState(70);

		React.useEffect(() => {
			const id = setInterval(() => {
				setValue((v) => (v >= 200 ? 70 : v + 1));
			}, 120);
			return () => clearInterval(id);
		}, []);

		return (
			<View className="flex-1 items-center justify-center bg-background p-6">
				<RollingNumber value={value} />
			</View>
		);
	},
};
