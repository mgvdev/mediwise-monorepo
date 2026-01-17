import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { SexSelector } from "./sex-selector";

const meta = {
	title: "Profile/SexSelector",
	component: SexSelector,
} satisfies Meta<typeof SexSelector>;

export default meta;

type Story = StoryObj<typeof SexSelector>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = React.useState<"male" | "female" | "other">(
			"other",
		);
		const [description, setDescription] = React.useState(
			"Voidkin - Defined by cosmic emptiness; identity rooted in silence and absence.",
		);

		return (
			<View className="flex-1 bg-background p-6">
				<SexSelector
					value={value}
					onChange={setValue}
					otherDescription={description}
					onOtherDescriptionChange={setDescription}
				/>
			</View>
		);
	},
};
