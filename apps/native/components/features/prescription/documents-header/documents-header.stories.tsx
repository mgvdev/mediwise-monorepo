import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { DocumentsHeader } from "./documents-header";

const meta = {
	title: "Prescription/DocumentsHeader",
	component: DocumentsHeader,
} satisfies Meta<typeof DocumentsHeader>;

export default meta;

type Story = StoryObj<typeof DocumentsHeader>;

export const Default: Story = {
	render: () => {
		return (
			<View className="flex-1 bg-background">
				<DocumentsHeader
					className="m-6"
					onPickFromLibrary={() => undefined}
					onTakePhoto={() => undefined}
					onAddManual={() => undefined}
				/>
			</View>
		);
	},
};
