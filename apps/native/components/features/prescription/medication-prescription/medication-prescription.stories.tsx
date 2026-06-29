import type { Meta } from "@storybook/react-native";
import { Button } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { MedicationListItem } from "@/components/features/prescription/medication-list-item";
import { createMedicationDraft } from "@/components/features/prescription/prescription-types";

import { MedicationPrescriptionCard } from "./medication-prescription";

const meta: Meta = {
	title: "Prescription/MedicationPrescription",
};

export default meta;

const baseMedication = createMedicationDraft({
	name: "Ibuprofen",
	dosage: "20mg",
	instructions: "After meal",
	comment: "Take with a full glass of water after a light snack.",
});

export const CardDefault = () => (
	<View className="bg-background flex-1 p-6">
		<MedicationPrescriptionCard
			medication={baseMedication}
			subtitle="Pain Relief"
			display={{ subtitle: true, details: true, comment: true }}
		/>
	</View>
);

export const CardEditable = () => {
	const [medication, setMedication] = useState(baseMedication);

	return (
		<View className="bg-background flex-1 p-6">
			<MedicationPrescriptionCard
				medication={medication}
				subtitle="Pain Relief"
				display={{ subtitle: true, details: true, comment: true }}
				editable
				onSubmit={setMedication}
				footer={<Text className="text-muted text-xs">Tap to edit</Text>}
			/>
		</View>
	);
};

export const ListItemDefault = () => (
	<View className="bg-background flex-1 p-6">
		<MedicationListItem
			medication={baseMedication}
			subtitle="Levothyroxine Sodium - Tablet"
			schedule="1 tablet at 12:22 am"
			display={{
				subtitle: true,
				schedule: true,
				details: true,
				instructions: true,
				comment: true,
			}}
		/>
	</View>
);

export const ListItemStack = () => {
	const [primary, setPrimary] = useState(baseMedication);
	const [vitamin, setVitamin] = useState({
		...baseMedication,
		name: "Vitamin D",
		dosage: "1000 IU",
	});

	return (
		<ScrollView className="bg-background flex-1 p-6">
			<View className="gap-6">
				<MedicationListItem
					medication={primary}
					subtitle="Levothyroxine Sodium - Tablet"
					schedule="1 tablet at 12:22 am"
					display={{
						subtitle: true,
						schedule: true,
						details: true,
						instructions: true,
						comment: true,
					}}
					editable
					onSubmit={setPrimary}
				/>
				<MedicationListItem
					medication={{
						...baseMedication,
						name: "Amoxiciline",
						dosage: "65mg",
					}}
					schedule="1 capsule at 8:10 am"
					display={{
						schedule: true,
						details: true,
						comment: true,
					}}
				/>
				<MedicationListItem
					medication={vitamin}
					subtitle="Daily supplement"
					schedule="1 tablet at 9:00 am"
					display={{
						subtitle: true,
						schedule: true,
						details: true,
					}}
					variant="card"
					editable
					onSubmit={setVitamin}
				/>
			</View>
		</ScrollView>
	);
};

export const ListItemEditPageAction = () => (
	<View className="bg-background flex-1 p-6">
		<MedicationListItem
			medication={baseMedication}
			subtitle="Levothyroxine Sodium - Tablet"
			schedule="1 tablet at 12:22 am"
			display={{
				subtitle: true,
				schedule: true,
				details: true,
				instructions: true,
				comment: true,
			}}
			variant="card"
			showEditPageAction
			onEditPage={() => console.log("[Storybook] edit page action clicked")}
		/>
		<View className="mt-4">
			<Button
				variant="secondary"
				onPress={() => console.log("[Storybook] simulate edit page")}
			>
				<Button.Label>Simulate edit page</Button.Label>
			</Button>
		</View>
	</View>
);
