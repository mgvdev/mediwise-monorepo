import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	Input,
	Label,
	Surface,
	TextField,
	useThemeColor,
} from "heroui-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { MedicationListItem } from "@/components/features/prescription/medication-list-item";
import type {
	MedicationDraft,
	PrescriptionDraft,
} from "@/components/features/prescription/prescription-types";

type PrescriptionEditorProps = {
	title: string;
	subtitle?: string;
	value: PrescriptionDraft;
	onChange: (next: PrescriptionDraft) => void;
	onAddMedication: () => void;
	onEditMedication: (index: number) => void;
	onSave: () => void;
	isSaving?: boolean;
	error?: string | null;
	topContent?: ReactNode;
	footerLabel?: string;
	showHeader?: boolean;
	onDelete?: () => void;
	isDeleting?: boolean;
	deleteLabel?: string;
};

function formatMedicationSchedule(medication: MedicationDraft) {
	const parts = [];
	if (medication.frequencyCount) {
		parts.push(`${medication.frequencyCount}x/${medication.frequencyUnit}`);
	}
	if (medication.durationType === "chronic") {
		parts.push("Chronic");
	} else if (medication.durationValue) {
		const plural = medication.durationValue === "1" ? "" : "s";
		parts.push(
			`for ${medication.durationValue} ${medication.durationUnit}${plural}`,
		);
	}
	return parts.join(" • ");
}

export function PrescriptionEditor({
	title,
	subtitle,
	value,
	onChange,
	onAddMedication,
	onEditMedication,
	onSave,
	isSaving,
	error,
	topContent,
	footerLabel = "Continue",
	showHeader = true,
	onDelete,
	isDeleting,
	deleteLabel = "Supprimer l'ordonnance",
}: PrescriptionEditorProps) {
	const accent = useThemeColor("accent");

	return (
		<View className="gap-5">
			{showHeader ? (
				<View className="gap-1">
					<Text className="text-foreground text-2xl font-semibold">
						{title}
					</Text>
					{subtitle ? (
						<Text className="text-muted text-xs">{subtitle}</Text>
					) : null}
				</View>
			) : null}

			{topContent}

			<Surface variant="secondary" className="rounded-2xl p-4">
				<Text className="text-foreground text-base font-semibold">
					General Info
				</Text>
				<View className="mt-3 gap-3">
					<TextField>
						<Label>Prescription Date</Label>
						<Input
							value={value.issuedDate}
							onChangeText={(text) => onChange({ ...value, issuedDate: text })}
							placeholder="YYYY-MM-DD"
						/>
					</TextField>
					<TextField>
						<Label>Valid Until</Label>
						<Input
							value={value.validUntil}
							onChangeText={(text) => onChange({ ...value, validUntil: text })}
							placeholder="YYYY-MM-DD"
						/>
					</TextField>
					<TextField>
						<Label>Doctor's Name</Label>
						<Input
							value={value.prescriberName}
							onChangeText={(text) =>
								onChange({ ...value, prescriberName: text })
							}
							placeholder="Dr. Hannibal Lecter"
						/>
					</TextField>
				</View>
			</Surface>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<View className="flex-row items-center justify-between">
					<Text className="text-foreground text-base font-semibold">
						Medication list
					</Text>
					<Pressable
						onPress={onAddMedication}
						className="flex-row items-center"
					>
						<Ionicons name="add" size={16} color={accent} />
						<Text className="text-primary text-sm font-semibold">
							Add another medication
						</Text>
					</Pressable>
				</View>
				<View className="mt-3 gap-3">
					{value.medications.length ? (
						value.medications.map((medication, index) => (
							<MedicationListItem
								key={medication.id}
								medication={medication}
								schedule={
									formatMedicationSchedule(medication) || "Add schedule"
								}
								display={{ schedule: true, details: true }}
								variant="card"
								enableEditor={false}
								onPress={() => onEditMedication(index)}
							/>
						))
					) : (
						<Text className="text-muted text-xs">
							No medications yet. Tap add to include one.
						</Text>
					)}
				</View>
			</Surface>

			{error ? <Text className="text-danger text-xs">{error}</Text> : null}

			<Button onPress={onSave} isDisabled={isSaving} className="mt-2">
				<Button.Label>{isSaving ? "Saving..." : footerLabel}</Button.Label>
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Suppression..." : deleteLabel}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
