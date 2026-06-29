import type { Meta } from "@storybook/react-native";
import { View } from "react-native";

import { RecapBuilderButton } from "./recap-builder-button";
import type { RecapSection } from "./recap-types";

const meta: Meta = {
	title: "Recap/RecapBuilderButton",
};

export default meta;

const sections: RecapSection[] = [
	{
		id: "profile",
		label: "Profile details",
		description: "Name, age, insurance, allergies",
	},
	{
		id: "medications",
		label: "Medications",
		description: "Current prescriptions and dosage",
	},
	{
		id: "conditions",
		label: "Conditions",
		description: "Chronic and acute conditions",
	},
	{
		id: "lab-results",
		label: "Lab results",
		description: "Latest lab panels and notes",
	},
	{
		id: "notes",
		label: "Notes",
		description: "Doctor notes and comments",
	},
];

export const Default = () => (
	<View className="bg-background flex-1 p-6">
		<RecapBuilderButton sections={sections} />
	</View>
);

export const Preselected = () => (
	<View className="bg-background flex-1 p-6">
		<RecapBuilderButton
			sections={sections}
			buttonLabel="Share recap"
			initialSelectedIds={["profile", "medications"]}
		/>
	</View>
);

export const FlowDemo = () => (
	<View className="bg-background flex-1 p-6">
		<RecapBuilderButton sections={sections} buttonLabel="Generate recap" />
	</View>
);
