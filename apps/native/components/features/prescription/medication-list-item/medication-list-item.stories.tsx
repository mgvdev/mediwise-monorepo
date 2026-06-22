import type { Meta } from "@storybook/react-native";
import { ScrollView, View } from "react-native";
import { createMedicationDraft } from "@/components/features/prescription/prescription-types";
import { MedicationListItem } from "./medication-list-item";

const meta: Meta = {
	title: "Prescription/MedicationListItem",
};

export default meta;

const baseMedication = createMedicationDraft({
	name: "Metformin",
	dosage: "500mg",
	instructions: "After meal",
	comment: "Take with a full glass of water.",
});

export const Default = () => (
	<View className="flex-1 bg-background p-6">
		<MedicationListItem
			medication={baseMedication}
			subtitle="Daily treatment"
			schedule="1x/day"
			display={{ subtitle: true, schedule: true, details: true }}
		/>
	</View>
);

export const Card = () => (
	<View className="flex-1 bg-background p-6">
		<MedicationListItem
			medication={baseMedication}
			subtitle="Daily treatment"
			schedule="1x/day"
			display={{ subtitle: true, schedule: true, details: true }}
			variant="card"
		/>
	</View>
);

export const Compact = () => (
	<View className="flex-1 bg-background p-6">
		<MedicationListItem
			medication={baseMedication}
			subtitle="Daily treatment"
			schedule="1x/day"
			display={{ subtitle: true, schedule: true }}
			variant="compact"
		/>
	</View>
);

export const Stack = () => (
	<ScrollView className="flex-1 bg-background p-6">
		<View className="gap-4">
			<MedicationListItem
				medication={baseMedication}
				subtitle="Morning"
				schedule="1x/day"
				display={{ subtitle: true, schedule: true, details: true }}
			/>
			<MedicationListItem
				medication={{
					...baseMedication,
					name: "Vitamin D",
					dosage: "1000 IU",
				}}
				subtitle="Supplement"
				schedule="1x/day"
				display={{ subtitle: true, schedule: true, details: true }}
				variant="compact"
			/>
		</View>
	</ScrollView>
);
