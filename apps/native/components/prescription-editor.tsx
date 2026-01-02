import { Ionicons } from "@expo/vector-icons";
import { Button, Surface, TextField, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import type {
	MedicationDraft,
	PrescriptionDraft,
} from "@/components/prescription-types";

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
};

function formatMedicationSummary(medication: MedicationDraft) {
	const parts = [];
	if (medication.dosage) parts.push(medication.dosage);
	if (medication.quantity) parts.push(`Qty: ${medication.quantity}`);
	if (medication.frequencyCount) {
		parts.push(`${medication.frequencyCount}x/${medication.frequencyUnit}`);
	}
	if (medication.durationValue) {
		parts.push(
			`${medication.durationValue} ${medication.durationUnit}${medication.durationValue === "1" ? "" : "s"}`,
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
}: PrescriptionEditorProps) {
	const accent = useThemeColor("primary");

	return (
		<View className="gap-5">
			<View className="gap-1">
				<Text className="font-semibold text-2xl text-foreground">{title}</Text>
				{subtitle ? (
					<Text className="text-muted text-xs">{subtitle}</Text>
				) : null}
			</View>

			{topContent}

			<Surface variant="secondary" className="rounded-2xl p-4">
				<Text className="font-semibold text-base text-foreground">
					General Info
				</Text>
				<View className="mt-3 gap-3">
					<TextField>
						<TextField.Label>Prescription Date</TextField.Label>
						<TextField.Input
							value={value.issuedDate}
							onChangeText={(text) => onChange({ ...value, issuedDate: text })}
							placeholder="YYYY-MM-DD"
						/>
					</TextField>
					<TextField>
						<TextField.Label>Valid Until</TextField.Label>
						<TextField.Input
							value={value.validUntil}
							onChangeText={(text) => onChange({ ...value, validUntil: text })}
							placeholder="YYYY-MM-DD"
						/>
					</TextField>
					<TextField>
						<TextField.Label>Doctor's Name</TextField.Label>
						<TextField.Input
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
					<Text className="font-semibold text-base text-foreground">
						Medication list
					</Text>
					<Pressable
						onPress={onAddMedication}
						className="flex-row items-center"
					>
						<Ionicons name="add" size={16} color={accent} />
						<Text className="font-semibold text-primary text-sm">
							Add another medication
						</Text>
					</Pressable>
				</View>
				<View className="mt-3 gap-3">
					{value.medications.length ? (
						value.medications.map((medication, index) => (
							<Pressable
								key={medication.id}
								onPress={() => onEditMedication(index)}
								className="rounded-2xl border border-border/60 bg-surface/40 p-3"
							>
								<View className="flex-row items-center justify-between">
									<View className="flex-1 pr-3">
										<Text className="font-medium text-foreground text-sm">
											{medication.name || "Untitled medication"}
										</Text>
										<Text className="text-muted text-xs">
											{formatMedicationSummary(medication) || "Add details"}
										</Text>
									</View>
									<Ionicons name="pencil" size={16} color="#94a3b8" />
								</View>
							</Pressable>
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
		</View>
	);
}
