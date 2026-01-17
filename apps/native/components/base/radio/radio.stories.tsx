import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Text, View } from "react-native";

import { Radio, RadioComment, RadioSelect, RadioStart } from "./radio";

const meta = {
	title: "Base/Radio",
	component: Radio,
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	render: () => {
		const [selected, setSelected] = React.useState("other");

		return (
			<View className="flex-1 gap-3 bg-background p-6">
				{[
					{ value: "male", label: "I am Male" },
					{ value: "female", label: "I am Female" },
					{ value: "other", label: "I am Other" },
				].map((option) => (
					<Radio
						key={option.value}
						selected={selected === option.value}
						onPress={() => setSelected(option.value)}
					>
						<View className="flex-row items-center justify-between">
							<RadioStart>
								<Text className="font-semibold text-base text-foreground">
									{option.label}
								</Text>
							</RadioStart>
							<RadioSelect selected={selected === option.value} />
						</View>
						{option.value === "other" && selected === "other" ? (
							<RadioComment>
								<Text className="text-muted text-sm">
									Add a short description here.
								</Text>
							</RadioComment>
						) : null}
					</Radio>
				))}
			</View>
		);
	},
};
