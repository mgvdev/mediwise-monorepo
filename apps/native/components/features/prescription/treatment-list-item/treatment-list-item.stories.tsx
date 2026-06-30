import type { Meta } from "@storybook/react-native";
import { View } from "react-native";

import {
	TreatmentListItem,
	type TreatmentMedication,
} from "./treatment-list-item";

const meta: Meta = {
	title: "Prescription/TreatmentListItem",
};

export default meta;

const chronicActive: TreatmentMedication = {
	name: "Doliprane",
	dosage: "50mg",
	frequencyCount: 3,
	frequencyUnit: "day",
	durationType: "chronic",
	form: "tablet",
	intakeMoments: ["morning", "evening"],
	status: "active",
};

const oneOffActive: TreatmentMedication = {
	name: "Amoxicilline",
	dosage: "500mg",
	frequencyCount: 2,
	frequencyUnit: "day",
	durationType: "one_off",
	durationValue: 7,
	durationUnit: "day",
	form: "capsule",
	intakeMoments: ["with_meal"],
	status: "active",
};

const ended: TreatmentMedication = {
	name: "Ibuprofène",
	dosage: "200mg",
	frequencyCount: 3,
	frequencyUnit: "day",
	durationType: "one_off",
	durationValue: 5,
	durationUnit: "day",
	form: "tablet",
	status: "ended",
};

const noMeta: TreatmentMedication = {
	name: "Vitamine D",
	status: "active",
};

function schedule(medication: TreatmentMedication) {
	const parts: string[] = [];
	if (medication.frequencyCount && medication.frequencyUnit) {
		parts.push(`${medication.frequencyCount}x/${medication.frequencyUnit}`);
	}
	if (medication.durationType === "chronic") {
		parts.push("Chronic");
	} else if (medication.durationValue && medication.durationUnit) {
		parts.push(`for ${medication.durationValue} ${medication.durationUnit}s`);
	}
	return parts.join(" • ");
}

export const Active = () => (
	<View className="bg-background flex-1 p-6">
		<TreatmentListItem
			medication={chronicActive}
			schedule={schedule(chronicActive)}
		/>
	</View>
);

export const Ended = () => (
	<View className="bg-background flex-1 p-6">
		<TreatmentListItem medication={ended} schedule={schedule(ended)} dimmed />
	</View>
);

export const List = () => {
	const rows = [chronicActive, oneOffActive, noMeta];
	return (
		<View className="bg-background flex-1 p-6">
			<View className="border-panel-border bg-panel-background rounded-3xl border px-4 py-2">
				{rows.map((medication, index) => (
					<View
						key={medication.name}
						className={index > 0 ? "border-panel-border border-t" : undefined}
					>
						<TreatmentListItem
							medication={medication}
							schedule={schedule(medication)}
						/>
					</View>
				))}
			</View>
		</View>
	);
};
