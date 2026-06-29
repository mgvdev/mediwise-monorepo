import { Ionicons } from "@expo/vector-icons";
import { Button, cn, Input, Label, Surface, TextField } from "heroui-native";
import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChoiceInput } from "@/components/base/choice";
import { DurationPicker } from "@/components/base/duration-picker";
import { FrequencyPicker } from "@/components/base/frequency-picker";
import {
	INTAKE_MOMENTS,
	MEDICATION_FORMS,
	type MedicationDraft,
} from "@/components/features/prescription/prescription-types";

type MedicationEditorProps = {
	value: MedicationDraft;
	onChange: (next: MedicationDraft) => void;
	onSave?: () => void;
	isEditable?: boolean;
	showClose?: boolean;
	onClose?: () => void;
	layout?: "inline" | "sheet";
	showHeader?: boolean;
	variant?: "surface" | "plain";
	animateIn?: boolean;
};

export function MedicationEditor({
	value,
	onChange,
	onSave,
	isEditable = true,
	showClose = true,
	onClose,
	layout = "inline",
	showHeader = true,
	variant = "surface",
	animateIn = false,
}: MedicationEditorProps) {
	const isSheet = layout === "sheet";
	const insets = useSafeAreaInsets();
	const safeBottom = Math.max(insets.bottom, 12) + 32;
	const frequencyCount = Number.parseInt(value.frequencyCount ?? "", 10);
	const durationCount = Number.parseInt(value.durationValue ?? "", 10);
	const isChronic = value.durationType === "chronic";
	const intakeMoments = value.intakeMoments ?? [];
	const toggleMoment = (moment: string) => {
		const next = intakeMoments.includes(moment)
			? intakeMoments.filter((item) => item !== moment)
			: [...intakeMoments, moment];
		onChange({ ...value, intakeMoments: next });
	};
	const Wrapper = variant === "surface" ? Surface : View;
	const opacity = useRef(new Animated.Value(animateIn ? 0 : 1)).current;
	const translateY = useRef(new Animated.Value(animateIn ? 12 : 0)).current;

	useEffect(() => {
		if (!animateIn) return;
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 220,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 220,
				useNativeDriver: true,
			}),
		]).start();
	}, [animateIn, opacity, translateY]);

	const content = (
		<Wrapper
			className={cn(
				variant === "surface"
					? "rounded-t-3xl bg-background px-6 pt-5"
					: "bg-transparent px-6 pt-5",
				isSheet && "min-h-0 flex-1",
			)}
			style={{ paddingBottom: safeBottom }}
		>
			{showHeader ? (
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
			) : null}

			<ScrollView
				showsVerticalScrollIndicator={false}
				className={cn(isSheet && "min-h-0 flex-1")}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
			>
				<View className="gap-4">
					<TextField>
						<Label>Medication Name</Label>
						<Input
							value={value.name}
							onChangeText={(text) => onChange({ ...value, name: text })}
							placeholder="Escitalopram"
							editable={isEditable}
						/>
					</TextField>

					<TextField>
						<Label>Medication Dose</Label>
						<Input
							value={value.dosage}
							onChangeText={(text) => onChange({ ...value, dosage: text })}
							placeholder="50mg"
							editable={isEditable}
						/>
					</TextField>

					<ChoiceInput
						label="Forme galénique"
						value={value.form ?? null}
						onChange={(next) =>
							onChange({ ...value, form: (next as string | null) ?? null })
						}
						options={MEDICATION_FORMS.map((form) => ({
							value: form.value,
							label: form.label,
						}))}
						layout="auto"
					/>

					<TextField>
						<Label>Comment</Label>
						<Input
							value={value.comment ?? ""}
							onChangeText={(text) => onChange({ ...value, comment: text })}
							placeholder="After meal"
							editable={isEditable}
							multiline
						/>
					</TextField>

					<View className="gap-2">
						<Label>Moments de prise</Label>
						<View className="flex-row flex-wrap gap-2">
							{INTAKE_MOMENTS.map((moment) => {
								const selected = intakeMoments.includes(moment.value);
								return (
									<Pressable
										key={moment.value}
										onPress={() => toggleMoment(moment.value)}
										disabled={!isEditable}
										accessibilityRole="button"
										accessibilityState={{ selected }}
										className={cn(
											"rounded-full border px-3 py-2",
											selected
												? "border-primary bg-primary/10"
												: "border-panel-border bg-surface/40",
										)}
									>
										<Text
											className={cn(
												"text-sm",
												selected ? "text-primary" : "text-muted",
											)}
										>
											{moment.label}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>

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

					<ChoiceInput
						label="Treatment duration"
						value={value.durationType}
						onChange={(next) =>
							onChange({
								...value,
								durationType: next === "chronic" ? "chronic" : "one_off",
								durationValue: next === "chronic" ? "" : value.durationValue,
							})
						}
						options={[
							{ value: "one_off", label: "Ponctuel" },
							{ value: "chronic", label: "Chronique" },
						]}
						layout="horizontal"
					/>

					{!isChronic ? (
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
					) : null}
				</View>
			</ScrollView>

			<Button
				className="mt-6"
				onPress={onSave ?? (() => undefined)}
				isDisabled={!onSave}
			>
				<Button.Label>Save Medication</Button.Label>
			</Button>
		</Wrapper>
	);

	if (!animateIn) return content;

	return (
		<Animated.View style={{ opacity, transform: [{ translateY }] }}>
			{content}
		</Animated.View>
	);
}
