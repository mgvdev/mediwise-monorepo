import { useMutation, useQuery } from "@tanstack/react-query";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { Button, Spinner, Surface, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import {
	type HealthField,
	healthCategories,
	healthCategoryMap,
} from "@/app/health/health-schema";
import { ChoiceInput, type ChoiceValue } from "@/components/base/choice";
import { DatePicker } from "@/components/base/date-picker/date-picker";
import { ListInput } from "@/components/base/list-input/list-input";
import { SafeAreaSheet } from "@/components/base/safe-area-sheet";
import { Body, Caption, H3 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { HeightPicker } from "@/components/medical-pickers/height-picker";
import { WeightPicker } from "@/components/medical-pickers/weight-picker";
import { trpc } from "@/utils/trpc";

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

function getBiologicalSex(values: FormState) {
	const key = buildFieldKey("personal_information", "biological_sex");
	return values[key] ?? null;
}

function getOnboardingCategories(values: FormState) {
	const sex = getBiologicalSex(values);
	return healthCategories.filter((category) => {
		if (!category.onlyForSex) return true;
		if (!sex) return false;
		return category.onlyForSex === sex;
	});
}

function isFieldComplete(
	field: HealthField,
	value: FormValue,
	commentValue: FormValue,
) {
	const isEmpty =
		value === null ||
		value === undefined ||
		(typeof value === "string" && value.trim().length === 0) ||
		(Array.isArray(value) && value.length === 0);

	if (field.optional && isEmpty) {
		return true;
	}
	if (field.type === "list") {
		return Array.isArray(value) && value.length > 0;
	}
	if (field.type === "choice") {
		if (!value) return false;
		if (field.commentOnYes && value === "yes") {
			return typeof commentValue === "string" && commentValue.trim().length > 0;
		}
		return true;
	}
	if (field.type === "number") {
		return typeof value === "string" && value.trim().length > 0;
	}
	if (field.type === "date") {
		return typeof value === "string" && value.trim().length > 0;
	}
	return typeof value === "string" && value.trim().length > 0;
}

export default function OnboardingCategoryScreen() {
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

	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
	});
	const saveMutation = useMutation(trpc.healthData.save.mutationOptions());
	const setStepMutation = useMutation(
		trpc.healthData.setOnboardingStep.mutationOptions(),
	);
	const completeMutation = useMutation(
		trpc.healthData.completeOnboarding.mutationOptions(),
	);
	const lastStepRef = React.useRef<string | null>(null);

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

	React.useEffect(() => {
		if (!resolvedCategory) return;
		if (lastStepRef.current === resolvedCategory.key) return;
		lastStepRef.current = resolvedCategory.key;
		setStepMutation.mutate({ categoryKey: resolvedCategory.key });
	}, [resolvedCategory?.key]);

	if (!resolvedCategory) {
		return <Redirect href="/onboarding" />;
	}

	const onboardingCategories = getOnboardingCategories(values);
	const currentIndex = onboardingCategories.findIndex(
		(category) => category.key === resolvedCategory.key,
	);
	if (currentIndex === -1) {
		const fallback = onboardingCategories[0]?.key ?? "personal_information";
		return <Redirect href={`/onboarding/${fallback}`} />;
	}
	const isFirst = currentIndex <= 0;
	const isLast = currentIndex === onboardingCategories.length - 1;

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

		handleChange(heightKey, String(heightCm));
		handleChange(unitKey, heightUnit);
		setActivePicker(null);
	};

	const confirmWeight = () => {
		const weightKey = buildFieldKey("personal_information", "weight_kg");
		const unitKey = buildFieldKey("personal_information", "weight_unit");
		const weightKg =
			weightUnit === "lbs" ? Math.round(weightValue / KG_TO_LBS) : weightValue;

		handleChange(weightKey, String(weightKg));
		handleChange(unitKey, weightUnit);
		setActivePicker(null);
	};

	const formatPickerValue = (value: string | null, unit: string) => {
		if (!value) return `Select ${unit}`;
		return `${value} ${unit}`;
	};

	const isComplete = Object.entries(resolvedCategory.fields).every(
		([fieldKey, field]) => {
			const storageKey = buildFieldKey(resolvedCategory.key, fieldKey);
			const commentKey = buildCommentKey(resolvedCategory.key, fieldKey);
			return isFieldComplete(
				field,
				values[storageKey] ?? null,
				values[commentKey] ?? null,
			);
		},
	);

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
				onSuccess: async () => {
					if (isLast) {
						await completeMutation.mutateAsync();
						router.replace("/");
						return;
					}
					const nextCategory = onboardingCategories[currentIndex + 1];
					if (nextCategory) {
						router.replace(`/onboarding/${nextCategory.key}`);
					}
				},
			},
		);
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen options={{ title: resolvedCategory.label }} />
			<View className="flex-1 justify-between">
				<View>
					<View className="mb-4 gap-1">
						<Caption>
							Step {currentIndex + 1} of {onboardingCategories.length}
						</Caption>
						<Caption>Complete all questions to continue.</Caption>
					</View>
					<View className="gap-4">
						{Object.entries(resolvedCategory.fields).map(
							([fieldKey, field]) => {
								const storageKey = buildFieldKey(
									resolvedCategory.key,
									fieldKey,
								);
								const value = values[storageKey];

								if (field.type === "choice" && field.choices) {
									const commentKey = buildCommentKey(
										resolvedCategory.key,
										fieldKey,
									);
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
													<TextField.Label>
														{field.commentOnYes.label}
													</TextField.Label>
													<TextField.Input
														value={(values[commentKey] as string | null) ?? ""}
														onChangeText={(next) =>
															handleChange(commentKey, next)
														}
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

								if (
									resolvedCategory.key === "personal_information" &&
									fieldKey === "height_cm"
								) {
									const unitKey = buildFieldKey(
										"personal_information",
										"height_unit",
									);
									const unit =
										(values[unitKey] as "cm" | "inch" | null) ?? "cm";
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
												value={(value as string | null) ?? ""}
												onChangeText={(next) => handleChange(storageKey, next)}
												placeholder={formatPlaceholder(field.label, field.type)}
												keyboardType={
													field.type === "number" ? "number-pad" : "default"
												}
											/>
										</TextField>
									</View>
								);
							},
						)}
					</View>
				</View>
				<View className="mt-6 gap-2">
					<View className="flex-row gap-3">
						<Button
							variant="secondary"
							className="flex-1"
							onPress={() => {
								if (isFirst) {
									router.back();
									return;
								}
								const prevCategory = onboardingCategories[currentIndex - 1];
								if (prevCategory) {
									router.replace(`/onboarding/${prevCategory.key}`);
								}
							}}
						>
							<Button.Label>Back</Button.Label>
						</Button>
						<Button
							className="flex-1"
							onPress={handleSave}
							isDisabled={!isComplete || saveMutation.isPending}
						>
							{saveMutation.isPending || completeMutation.isPending ? (
								<Spinner size="sm" color="default" />
							) : (
								<Button.Label>{isLast ? "Finish" : "Next"}</Button.Label>
							)}
						</Button>
					</View>
					{saveMutation.isError ? (
						<Caption className="text-danger">
							{saveMutation.error?.message ??
								"Something went wrong while saving."}
						</Caption>
					) : null}
				</View>
			</View>
			<SafeAreaSheet
				visible={activePicker !== null}
				onClose={() => setActivePicker(null)}
				presentationStyle="overFullScreen"
				contentStyle={{ height: 460 }}
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
