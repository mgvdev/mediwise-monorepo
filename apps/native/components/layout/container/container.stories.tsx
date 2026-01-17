import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

import { Container } from "./container";

const meta = {
	title: "Layout/Container",
	component: Container,
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
	render: () => (
		<Container scroll={false} className="items-center justify-center">
			<View className="items-center">
				<Text className="text-base text-foreground">Container content</Text>
				<Text className="mt-2 text-muted text-xs">Safe area aware</Text>
			</View>
		</Container>
	),
};
