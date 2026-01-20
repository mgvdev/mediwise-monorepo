import { Ionicons } from "@expo/vector-icons";
import { Button, cn, Surface, TextField } from "heroui-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DurationPicker } from "@/components/base/duration-picker";
import { FrequencyPicker } from "@/components/base/frequency-picker";
import { MedicationShapePicker } from "@/components/features/prescription/medication-shape-picker";
import type { MedicationDraft } from "@/components/features/prescription/prescription-types";

type MedicationEditorProps = {
	value: MedicationDraft;
	onChange: (next: MedicationDraft) => void;
	onSave?: () => void;
	isEditable?: boolean;
	showClose?: boolean;
	onClose?: () => void;
	layout?: "inline" | "sheet";
};

export function MedicationEditor({
	value,
	onChange,
	onSave,
	isEditable = true,
	showClose = true,
	onClose,
	layout = "inline",
}: MedicationEditorProps) {
	const isSheet = layout === "sheet";
	const frequencyCount = Number.parseInt(value.frequencyCount ?? "", 10);
	const durationCount = Number.parseInt(value.durationValue ?? "", 10);

	return (
		<Surface
			className={cn(
				"rounded-t-3xl bg-background px-6 pt-5 pb-8",
				isSheet && "min-h-0 flex-1",
			)}
		>
			<View className="mb-4 flex-row items-center justify-between">
				<Text className="font-semibold text-foreground text-lg">
					Edit Medication
				</Text>
				{showClose ? (
					<Pressable
						className="h-9 w-9 items-center justify-center rounded-full bg-surface/60"
						accessibilityRole="button"
						accessibilityLabel="Close medication editor"
						onPress={onClose}
					>
						<Ionicons name="close" size={20} className="text-foreground" />
					</Pressable>
				) : null}
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				className={cn(isSheet && "min-h-0 flex-1")}
				contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
			>
				<View className="gap-4">
					<MedicationShapePicker
						value={value.shape ?? "capsule"}
						onChange={(shape) => onChange({ ...value, shape })}
						showValueLabel={false}
					/>
					<TextField>
						<TextField.Label>Medication Name</TextField.Label>
						<TextField.Input
							value={value.name}
							onChangeText={(text) => onChange({ ...value, name: text })}
							placeholder="Escitalopram"
							editable={isEditable}
						/>
					</TextField>

					<View className="flex-row gap-3">
						<View className="flex-1">
							<TextField>
								<TextField.Label>Medication Dose</TextField.Label>
								<TextField.Input
									value={value.dosage}
									onChangeText={(text) => onChange({ ...value, dosage: text })}
									placeholder="50mg"
									editable={isEditable}
								/>
							</TextField>
						</View>
						<View className="flex-1">
							<TextField>
								<TextField.Label>Medication Type</TextField.Label>
								<TextField.Input
									value={value.type}
									onChangeText={(text) => onChange({ ...value, type: text })}
									placeholder="Tablet"
									editable={isEditable}
								/>
							</TextField>
						</View>
					</View>

					<TextField>
						<TextField.Label>Medication Quantity</TextField.Label>
						<TextField.Input
							value={value.quantity}
							onChangeText={(text) => onChange({ ...value, quantity: text })}
							placeholder="30 tablets"
							editable={isEditable}
						/>
					</TextField>

					<TextField>
						<TextField.Label>Comment</TextField.Label>
						<TextField.Input
							value={value.comment ?? ""}
							onChangeText={(text) => onChange({ ...value, comment: text })}
							placeholder="After meal"
							editable={isEditable}
							multiline
						/>
					</TextField>

					<FrequencyPicker
						value={{
							frequency: Number.isNaN(frequencyCount) ? 0 : frequencyCount,
							frequencyUnit: value.frequencyUnit,
						}}
						onChange={(next) =>
							onChange({
								...value,
								frequencyCount: String(next.frequency ?? 0),
								frequencyUnit: next.frequencyUnit,
							})
						}
						isEditable={isEditable}
					/>

					<DurationPicker
						value={{
							duration: Number.isNaN(durationCount) ? 0 : durationCount,
							durationUnit: value.durationUnit,
						}}
						onChange={(next) =>
							onChange({
								...value,
								durationValue: String(next.duration ?? 0),
								durationUnit: next.durationUnit,
							})
						}
						isEditable={isEditable}
					/>
				</View>
			</ScrollView>

			<Button
				className="mt-6"
				onPress={onSave ?? (() => undefined)}
				isDisabled={!onSave}
			>
				<Button.Label>Save Medication</Button.Label>
			</Button>
		</Surface>
	);
}
