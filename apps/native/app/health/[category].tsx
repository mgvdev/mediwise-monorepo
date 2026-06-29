import { useMutation, useQuery } from "@tanstack/react-query";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import {
	Button,
	Input,
	Label,
	Spinner,
	TextField,
	useToast,
} from "heroui-native";
import * as React from "react";
import { View } from "react-native";

import { BloodGroupInput } from "@/components/base/blood-group-input";
import { BloodPressureInput } from "@/components/base/blood-pressure-input";
import { ChoiceInput, type ChoiceValue } from "@/components/base/choice";
import { DatePicker } from "@/components/base/date-picker/date-picker";
import { HeightInput } from "@/components/base/height-input/height-input";
import { ListInput } from "@/components/base/list-input/list-input";
import { Caption } from "@/components/base/typography";
import { WeightInput } from "@/components/base/weight-input/weight-input";
import { Container } from "@/components/layout/container";
import { trpc } from "@/utils/trpc";

import { type HealthField, healthCategoryMap } from "./health-schema";

type FormValue = string | string[] | null;

type FormState = Record<string, FormValue>;

const buildFieldKey = (categoryKey: string, fieldKey: string) =>
	`health.${categoryKey}.${fieldKey}`;
const buildCommentKey = (categoryKey: string, fieldKey: string) =>
	`health.${categoryKey}.${fieldKey}_comment`;

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
	const [heightUnit, setHeightUnit] = React.useState<"cm" | "inch">("cm");
	const [heightValue, setHeightValue] = React.useState(170);
	const [weightUnit, setWeightUnit] = React.useState<"kg" | "lbs">("kg");
	const [weightValue, setWeightValue] = React.useState(68);

	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
	});
	const saveMutation = useMutation(trpc.healthData.save.mutationOptions());
	const { toast } = useToast();

	React.useEffect(() => {
		if (!healthQuery.data?.data) return;
		setValues((prev) => {
			const next = { ...prev };
			Object.entries(healthQuery.data?.data ?? {}).forEach(
				([categoryKey, fields]) => {
					Object.entries(fields ?? {}).forEach(([fieldKey, fieldValue]) => {
						const key = buildFieldKey(categoryKey, fieldKey);
						if (next[key] === undefined) {
							next[key] = (fieldValue ?? null) as FormValue;
						}
					});
				},
			);
			return next;
		});
	}, [healthQuery.data?.data]);

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
	};

	const formatPickerValue = (value: string | null, unit: string) => {
		if (!value) return `Select ${unit}`;
		return `${value} ${unit}`;
	};

	const handleSave = () => {
		if (!resolvedCategory) return;
		const valuesByField: Record<string, FormValue> = {};
		Object.entries(resolvedCategory.fields).forEach(([fieldKey, field]) => {
			const storageKey = buildFieldKey(resolvedCategory.key, fieldKey);
			const rawValue = values[storageKey];
			if (field.commentOnYes) {
				const commentKey = buildCommentKey(resolvedCategory.key, fieldKey);
				valuesByField[`${fieldKey}_comment`] = values[commentKey] ?? null;
			}
			if (field.type === "list") {
				valuesByField[fieldKey] = Array.isArray(rawValue) ? rawValue : [];
			} else {
				valuesByField[fieldKey] = rawValue ?? null;
			}
		});
		saveMutation.mutate(
			{
				categoryKey: resolvedCategory.key,
				values: valuesByField,
			},
			{
				onSuccess: () => {
					toast.show({
						label: "Your medical record has been updated.",
						variant: "success",
					});
					router.back();
				},
			},
		);
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
						const commentKey = buildCommentKey(resolvedCategory.key, fieldKey);
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
								{field.commentOnYes && value === "yes" ? (
									<TextField>
										<Label>{field.commentOnYes.label}</Label>
										<Input
											value={(values[commentKey] as string | null) ?? ""}
											onChangeText={(next) => handleChange(commentKey, next)}
											placeholder="Add details"
										/>
									</TextField>
								) : null}
							</View>
						);
					}

					if (field.type === "list") {
						const listValue = Array.isArray(value) ? value : [];
						return (
							<View key={storageKey} className="gap-2">
								<ListInput
									label={field.label}
									value={listValue}
									onChange={(next) => handleChange(storageKey, next)}
									placeholder="Add item"
								/>
							</View>
						);
					}

					if (field.type === "date") {
						return (
							<View key={storageKey} className="gap-2">
								<Caption>{field.label}</Caption>
								<DatePicker
									label={field.label}
									helperText="Tap to select date"
									value={(value as string | null) ?? null}
									onChange={(next) => handleChange(storageKey, next)}
								/>
							</View>
						);
					}

					if (field.type === "blood_pressure") {
						return (
							<View key={storageKey} className="gap-2">
								<BloodPressureInput
									label={field.label}
									value={(value as string | null) ?? null}
									onChange={(next) => handleChange(storageKey, next)}
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
							<HeightInput
								key={storageKey}
								label={field.label}
								valueLabel={formatPickerValue(displayValue, unit)}
								pickerValue={heightValue}
								pickerUnit={heightUnit}
								onPickerChange={(nextValue, nextUnit) => {
									setHeightUnit(nextUnit);
									setHeightValue(nextValue);
								}}
								onOpen={openHeightPicker}
								onConfirm={confirmHeight}
							/>
						);
					}

					if (
						resolvedCategory.key === "personal_information" &&
						fieldKey === "blood_group"
					) {
						return (
							<View key={storageKey} className="gap-2">
								<BloodGroupInput
									value={(value as string | null) ?? null}
									onChange={(next) => handleChange(storageKey, next)}
								/>
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
							<WeightInput
								key={storageKey}
								label={field.label}
								valueLabel={formatPickerValue(displayValue, unit)}
								pickerValue={weightValue}
								pickerUnit={weightUnit}
								onPickerChange={(nextValue, nextUnit) => {
									setWeightUnit(nextUnit);
									setWeightValue(nextValue);
								}}
								onOpen={openWeightPicker}
								onConfirm={confirmWeight}
								snapPoints={[440]}
							/>
						);
					}

					return (
						<View key={storageKey} className="gap-2">
							<TextField>
								<Label>{field.label}</Label>
								<Input
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
			<View className="mt-6">
				<Button onPress={handleSave} isDisabled={saveMutation.isPending}>
					{saveMutation.isPending ? (
						<Spinner size="sm" color="default" />
					) : (
						<Button.Label>Save</Button.Label>
					)}
				</Button>
				{saveMutation.isError ? (
					<Caption className="text-danger mt-2">
						Something went wrong while saving.
					</Caption>
				) : null}
			</View>
		</Container>
	);
}
