import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Button, Surface, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { ChoiceInput, type ChoiceValue } from "@/components/base/choice";
import { SafeAreaSheet } from "@/components/base/safe-area-sheet";
import { Body, Caption, H3 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { HeightPicker } from "@/components/medical-pickers/height-picker";
import { WeightPicker } from "@/components/medical-pickers/weight-picker";
import { type HealthField, healthCategoryMap } from "./health-schema";

type FormValue = string | null;

type FormState = Record<string, FormValue>;

const buildFieldKey = (categoryKey: string, fieldKey: string) =>
	`health.${categoryKey}.${fieldKey}`;

const CM_TO_IN = 0.3937008;
const KG_TO_LBS = 2.20462;

const formatChoiceLabel = (value: string) => {
	const cleaned = value.replace(/_/g, " ");
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const formatPlaceholder = (label: string, type: HealthField["type"]) => {
	if (type === "number") return "Enter a number";
	if (label.toLowerCase().includes("date")) return "MM/DD/YYYY";
	return "Add details";
};

export default function HealthCategoryScreen() {
	const { category } = useLocalSearchParams<{
		category?: string | string[];
	}>();
	const resolvedKey = Array.isArray(category) ? category[0] : category;
	const resolvedCategory = resolvedKey
		? healthCategoryMap.get(resolvedKey)
		: undefined;
	const [values, setValues] = React.useState<FormState>({});
	const [activePicker, setActivePicker] = React.useState<
		"height" | "weight" | null
	>(null);
	const [heightUnit, setHeightUnit] = React.useState<"cm" | "inch">("cm");
	const [heightValue, setHeightValue] = React.useState(170);
	const [weightUnit, setWeightUnit] = React.useState<"kg" | "lbs">("kg");
	const [weightValue, setWeightValue] = React.useState(68);
	if (!resolvedCategory) {
		return <Redirect href="/" />;
	}

	const handleChange = (key: string, value: FormValue) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	const openHeightPicker = () => {
		const heightKey = buildFieldKey("personal_information", "height_cm");
		const unitKey = buildFieldKey("personal_information", "height_unit");
		const storedCm = Number.parseInt(values[heightKey] ?? "", 10);
		const baseCm = Number.isNaN(storedCm) ? 170 : storedCm;
		const unit = (values[unitKey] as "cm" | "inch" | null) ?? ("cm" as const);
		const displayValue =
			unit === "inch" ? Math.round(baseCm * CM_TO_IN) : baseCm;

		setHeightUnit(unit);
		setHeightValue(displayValue);
		setActivePicker("height");
	};

	const openWeightPicker = () => {
		const weightKey = buildFieldKey("personal_information", "weight_kg");
		const unitKey = buildFieldKey("personal_information", "weight_unit");
		const storedKg = Number.parseInt(values[weightKey] ?? "", 10);
		const baseKg = Number.isNaN(storedKg) ? 68 : storedKg;
		const unit = (values[unitKey] as "kg" | "lbs" | null) ?? ("kg" as const);
		const displayValue =
			unit === "lbs" ? Math.round(baseKg * KG_TO_LBS) : baseKg;

		setWeightUnit(unit);
		setWeightValue(displayValue);
		setActivePicker("weight");
	};

	const confirmHeight = () => {
		const heightKey = buildFieldKey("personal_information", "height_cm");
		const unitKey = buildFieldKey("personal_information", "height_unit");
		const heightCm =
			heightUnit === "inch" ? Math.round(heightValue / CM_TO_IN) : heightValue;

		// Store metric only; unit is kept just for display preferences.
		// TODO: Persist these keys when wiring save/load.
		handleChange(heightKey, String(heightCm));
		handleChange(unitKey, heightUnit);
		setActivePicker(null);
	};

	const confirmWeight = () => {
		const weightKey = buildFieldKey("personal_information", "weight_kg");
		const unitKey = buildFieldKey("personal_information", "weight_unit");
		const weightKg =
			weightUnit === "lbs" ? Math.round(weightValue / KG_TO_LBS) : weightValue;

		// Store metric only; unit is kept just for display preferences.
		// TODO: Persist these keys when wiring save/load.
		handleChange(weightKey, String(weightKg));
		handleChange(unitKey, weightUnit);
		setActivePicker(null);
	};

	const formatPickerValue = (value: string | null, unit: string) => {
		if (!value) return `Select ${unit}`;
		return `${value} ${unit}`;
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen options={{ title: resolvedCategory.label }} />
			<View className="mb-4">
				<Caption>Health profile</Caption>
			</View>
			<View className="gap-4">
				{Object.entries(resolvedCategory.fields).map(([fieldKey, field]) => {
					const storageKey = buildFieldKey(resolvedCategory.key, fieldKey);
					// TODO: Use storageKey when wiring persistence (save/load) later.
					const value = values[storageKey];

					if (field.type === "choice" && field.choices) {
						return (
							<View key={storageKey} className="gap-2">
								<ChoiceInput
									label={field.label}
									value={(value as ChoiceValue) ?? null}
									onChange={(next) => handleChange(storageKey, next)}
									options={field.choices.map((choice) => ({
										value: choice,
										label: formatChoiceLabel(choice),
									}))}
									layout="auto"
								/>
							</View>
						);
					}

					if (
						resolvedCategory.key === "personal_information" &&
						fieldKey === "height_cm"
					) {
						const unitKey = buildFieldKey(
							"personal_information",
							"height_unit",
						);
						const unit = (values[unitKey] as "cm" | "inch" | null) ?? "cm";
						const parsed = Number.parseInt(value ?? "", 10);
						const displayValue = Number.isNaN(parsed)
							? null
							: unit === "inch"
								? String(Math.round(parsed * CM_TO_IN))
								: String(parsed);

						return (
							<View key={storageKey} className="gap-2">
								<Caption>{field.label}</Caption>
								<Pressable
									onPress={openHeightPicker}
									className="rounded-2xl border border-panel-border bg-panel-background px-4 py-3"
								>
									<Body>{formatPickerValue(displayValue, unit)}</Body>
								</Pressable>
							</View>
						);
					}

					if (
						resolvedCategory.key === "personal_information" &&
						fieldKey === "weight_kg"
					) {
						const unitKey = buildFieldKey(
							"personal_information",
							"weight_unit",
						);
						const unit = (values[unitKey] as "kg" | "lbs" | null) ?? "kg";
						const parsed = Number.parseInt(value ?? "", 10);
						const displayValue = Number.isNaN(parsed)
							? null
							: unit === "lbs"
								? String(Math.round(parsed * KG_TO_LBS))
								: String(parsed);

						return (
							<View key={storageKey} className="gap-2">
								<Caption>{field.label}</Caption>
								<Pressable
									onPress={openWeightPicker}
									className="rounded-2xl border border-panel-border bg-panel-background px-4 py-3"
								>
									<Body>{formatPickerValue(displayValue, unit)}</Body>
								</Pressable>
							</View>
						);
					}

					return (
						<View key={storageKey} className="gap-2">
							<TextField>
								<TextField.Label>{field.label}</TextField.Label>
								<TextField.Input
									value={value ?? ""}
									onChangeText={(next) => handleChange(storageKey, next)}
									placeholder={formatPlaceholder(field.label, field.type)}
									keyboardType={
										field.type === "number" ? "number-pad" : "default"
									}
								/>
							</TextField>
						</View>
					);
				})}
			</View>
			<SafeAreaSheet
				visible={activePicker !== null}
				onClose={() => setActivePicker(null)}
			>
				<Surface variant="secondary" className="rounded-3xl p-5">
					{activePicker === "height" ? (
						<View className="gap-4">
							<H3>Select your height</H3>
							<HeightPicker
								value={heightValue}
								unit={heightUnit}
								onChange={(nextValue, nextUnit) => {
									setHeightUnit(nextUnit);
									setHeightValue(nextValue);
								}}
							/>
							<View className="flex-row gap-2">
								<Button
									variant="secondary"
									className="flex-1"
									onPress={() => setActivePicker(null)}
								>
									<Button.Label>Cancel</Button.Label>
								</Button>
								<Button className="flex-1" onPress={confirmHeight}>
									<Button.Label>Save</Button.Label>
								</Button>
							</View>
						</View>
					) : null}
					{activePicker === "weight" ? (
						<View className="gap-4">
							<H3>Select your weight</H3>
							<WeightPicker
								value={weightValue}
								unit={weightUnit}
								onChange={(nextValue, nextUnit) => {
									setWeightUnit(nextUnit);
									setWeightValue(nextValue);
								}}
							/>
							<View className="flex-row gap-2">
								<Button
									variant="secondary"
									className="flex-1"
									onPress={() => setActivePicker(null)}
								>
									<Button.Label>Cancel</Button.Label>
								</Button>
								<Button className="flex-1" onPress={confirmWeight}>
									<Button.Label>Save</Button.Label>
								</Button>
							</View>
						</View>
					) : null}
				</Surface>
			</SafeAreaSheet>
		</Container>
	);
}
