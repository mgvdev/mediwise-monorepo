import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import {
	type MedicationShapeId,
	MedicationShapePicker,
} from "./medication-shape-picker";

const meta: Meta = {
	title: "Prescription/MedicationShapePicker",
};

export default meta;

export const Default = () => {
	const [value, setValue] = useState<MedicationShapeId>("capsule");

	return (
		<View className="flex-1 bg-background p-6">
			<MedicationShapePicker value={value} onChange={setValue} />
		</View>
	);
};
