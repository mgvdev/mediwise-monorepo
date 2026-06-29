import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { TagEditor } from "./tag-editor";

const meta = {
	title: "Profile/TagEditor",
	component: TagEditor,
} satisfies Meta<typeof TagEditor>;

export default meta;

type Story = StoryObj<typeof TagEditor>;

export const Default: Story = {
	render: () => {
		const [tags, setTags] = React.useState(["Peanuts", "Gluten"]);

		return (
			<View className="bg-background flex-1 p-6">
				<TagEditor
					label="Allergies"
					placeholder="Add allergy"
					value={tags}
					onChange={setTags}
				/>
			</View>
		);
	},
};
