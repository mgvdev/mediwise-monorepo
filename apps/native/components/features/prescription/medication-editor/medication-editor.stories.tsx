import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { createMedicationDraft } from "../prescription-types";
import { MedicationEditor } from "./medication-editor";

const meta = {
	title: "Prescription/MedicationEditor",
	component: MedicationEditor,
} satisfies Meta<typeof MedicationEditor>;

export default meta;

type Story = StoryObj<typeof MedicationEditor>;

export const Default: Story = {
	render: () => {
		const [draft, setDraft] = React.useState(
			createMedicationDraft({ name: "Escitalopram" }),
		);

		return (
			<MedicationEditor
				value={draft}
				onChange={setDraft}
				onSave={() => undefined}
			/>
		);
	},
};
