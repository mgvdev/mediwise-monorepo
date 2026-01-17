import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { View } from "react-native";

import { createPrescriptionDraft } from "../prescription-types";
import { PrescriptionEditor } from "./prescription-editor";

const meta = {
	title: "Prescription/PrescriptionEditor",
	component: PrescriptionEditor,
} satisfies Meta<typeof PrescriptionEditor>;

export default meta;

type Story = StoryObj<typeof PrescriptionEditor>;

export const Default: Story = {
	render: () => {
		const [draft, setDraft] = React.useState(createPrescriptionDraft());

		return (
			<View className="flex-1 bg-background p-6">
				<PrescriptionEditor
					title="Add Prescription"
					subtitle="Enter prescription details and medications."
					value={draft}
					onChange={setDraft}
					onAddMedication={() => undefined}
					onEditMedication={() => undefined}
					onSave={() => undefined}
				/>
			</View>
		);
	},
};
