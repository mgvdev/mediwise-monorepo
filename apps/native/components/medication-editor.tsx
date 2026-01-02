import { Ionicons } from "@expo/vector-icons";
import { Button, Surface, TextField, useThemeColor } from "heroui-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import type {
	DurationUnit,
	FrequencyUnit,
	MedicationDraft,
} from "@/components/prescription-types";

type MedicationEditorProps = {
	visible: boolean;
	value: MedicationDraft;
	onChange: (next: MedicationDraft) => void;
	onClose: () => void;
	onSave: () => void;
};

type UnitToggleProps<T extends string> = {
	label: string;
	value: T;
	options: T[];
	onChange: (value: T) => void;
};

function UnitToggle<T extends string>({
	label,
	value,
	options,
	onChange,
}: UnitToggleProps<T>) {
	return (
		<View className="gap-2">
			<Text className="text-muted text-xs">{label}</Text>
			<View className="flex-row flex-wrap gap-2">
				{options.map((option) => {
					const active = option === value;
					return (
						<Pressable
							key={option}
							onPress={() => onChange(option)}
							className={`rounded-full px-3 py-1 ${active ? "bg-primary" : "bg-surface/60"}`}
						>
							<Text
								className={active ? "text-primary-foreground" : "text-muted"}
							>
								{option}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

export function MedicationEditorModal({
	visible,
	value,
	onChange,
	onClose,
	onSave,
}: MedicationEditorProps) {
	const foreground = useThemeColor("foreground");

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View className="flex-1 justify-end bg-black/40">
				<Surface className="rounded-t-3xl bg-background px-6 pt-5 pb-8">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground text-lg">
							Edit Medication
						</Text>
						<Pressable onPress={onClose}>
							<Ionicons name="close" size={20} color={foreground} />
						</Pressable>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						<View className="gap-4">
							<TextField>
								<TextField.Label>Medication Name</TextField.Label>
								<TextField.Input
									value={value.name}
									onChangeText={(text) => onChange({ ...value, name: text })}
									placeholder="Escitalopram"
								/>
							</TextField>

							<View className="flex-row gap-3">
								<View className="flex-1">
									<TextField>
										<TextField.Label>Medication Dose</TextField.Label>
										<TextField.Input
											value={value.dosage}
											onChangeText={(text) =>
												onChange({ ...value, dosage: text })
											}
											placeholder="50mg"
										/>
									</TextField>
								</View>
								<View className="flex-1">
									<TextField>
										<TextField.Label>Medication Type</TextField.Label>
										<TextField.Input
											value={value.type}
											onChangeText={(text) =>
												onChange({ ...value, type: text })
											}
											placeholder="Tablet"
										/>
									</TextField>
								</View>
							</View>

							<TextField>
								<TextField.Label>Medication Quantity</TextField.Label>
								<TextField.Input
									value={value.quantity}
									onChangeText={(text) =>
										onChange({ ...value, quantity: text })
									}
									placeholder="30 tablets"
								/>
							</TextField>

							<View className="flex-row gap-3">
								<View className="flex-1">
									<TextField>
										<TextField.Label>Frequency</TextField.Label>
										<TextField.Input
											value={value.frequencyCount}
											onChangeText={(text) =>
												onChange({ ...value, frequencyCount: text })
											}
											placeholder="3"
											keyboardType="number-pad"
										/>
									</TextField>
								</View>
								<View className="flex-1">
									<UnitToggle<FrequencyUnit>
										label="Per"
										value={value.frequencyUnit}
										options={["day", "week", "month"]}
										onChange={(next) =>
											onChange({ ...value, frequencyUnit: next })
										}
									/>
								</View>
							</View>

							<View className="flex-row gap-3">
								<View className="flex-1">
									<TextField>
										<TextField.Label>Duration</TextField.Label>
										<TextField.Input
											value={value.durationValue}
											onChangeText={(text) =>
												onChange({ ...value, durationValue: text })
											}
											placeholder="4"
											keyboardType="number-pad"
										/>
									</TextField>
								</View>
								<View className="flex-1">
									<UnitToggle<DurationUnit>
										label="Unit"
										value={value.durationUnit}
										options={["day", "week", "month"]}
										onChange={(next) =>
											onChange({ ...value, durationUnit: next })
										}
									/>
								</View>
							</View>
						</View>
					</ScrollView>

					<Button className="mt-6" onPress={onSave}>
						<Button.Label>Save Medication</Button.Label>
					</Button>
				</Surface>
			</View>
		</Modal>
	);
}
