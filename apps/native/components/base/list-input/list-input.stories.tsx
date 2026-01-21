import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { ListInput } from "./list-input";

const meta = {
	title: "Base/ListInput",
	component: ListInput,
} satisfies Meta<typeof ListInput>;

export default meta;

type Story = StoryObj<typeof ListInput>;

export const Default: Story = {
	render: () => {
		const [items, setItems] = React.useState(["Peanuts", "Penicillin"]);

		return (
			<View className="flex-1 bg-background p-6">
				<ListInput
					label="Allergies"
					value={items}
					onChange={setItems}
					placeholder="Add an allergy"
					helperText="List drug or food allergies."
				/>
			</View>
		);
	},
};
