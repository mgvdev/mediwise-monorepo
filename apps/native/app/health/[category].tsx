import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { ChoiceInput, type ChoiceValue } from "@/components/base/choice";
import { Container } from "@/components/layout/container";
import { applyOpacity } from "@/components/utils";
import { type HealthField, healthCategoryMap } from "./health-schema";

type FormValue = string | null;

type FormState = Record<string, FormValue>;

const buildFieldKey = (categoryKey: string, fieldKey: string) =>
	`health.${categoryKey}.${fieldKey}`;

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
	const primary = useThemeColor("primary");

	if (!resolvedCategory) {
		return <Redirect href="/" />;
	}

	const handleChange = (key: string, value: FormValue) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Container className="px-6 pt-12 pb-12">
			<View className="mb-6 flex-row items-center justify-between">
				<View className="flex-1">
					<Text className="text-muted text-xs">Health profile</Text>
					<Text className="mt-1 font-semibold text-2xl text-foreground">
						{resolvedCategory.label}
					</Text>
				</View>
				<Pressable
					onPress={() => router.back()}
					className="h-9 w-9 items-center justify-center rounded-full"
					style={{
						backgroundColor: applyOpacity(primary, 0.12) ?? "transparent",
					}}
				>
					<Ionicons name="close" size={18} color={primary} />
				</Pressable>
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
		</Container>
	);
}
