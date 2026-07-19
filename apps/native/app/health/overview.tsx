import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { MedicalSummaryCard } from "@/components/features/medical-summary";
import {
	RecapBuilderModal,
	type RecapSection,
} from "@/components/features/recap/recap-builder-button";
import { Container } from "@/components/layout/container";
import { HorizontalStack, VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { trpc } from "@/utils/trpc";

import {
	type HealthField,
	filterHealthCategoriesBySex,
	healthCategories,
} from "./health-schema";

type FieldValue = string | string[] | null | undefined;

const RECAP_SECTIONS: RecapSection[] = [
	{
		id: "personnal_information",
		label: "Personal information",
		description: "Basics about you",
	},
	{
		id: "prescriptions",
		label: "Prescriptions",
		description: "Current medications and dosage",
	},
	{
		id: "allergies",
		label: "Allergies",
		description: "Known drug or food allergies",
	},
	{
		id: "conditions",
		label: "Conditions",
		description: "Ongoing medical conditions",
	},
	{
		id: "tests",
		label: "Recent tests",
		description: "Latest lab results or scans",
	},
];

const formatChoiceLabel = (value: string) => {
	const cleaned = value.replace(/_/g, " ");
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const formatDateValue = (value: string) => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString();
};

const formatFieldValue = (
	field: HealthField,
	value: FieldValue,
	categoryValues: Record<string, FieldValue>,
	fieldKey: string,
) => {
	if (value == null) return "—";
	if (field.type === "list") {
		const list = Array.isArray(value) ? value : [];
		return list.length ? list.join(", ") : "—";
	}
	if (field.type === "choice") {
		if (typeof value !== "string" || !value) return "—";
		const label = formatChoiceLabel(value);
		if (field.commentOnYes && value === "yes") {
			const comment = categoryValues[`${fieldKey}_comment`];
			if (typeof comment === "string" && comment.trim()) {
				return `${label} — ${comment.trim()}`;
			}
		}
		return label;
	}
	if (field.type === "date" && typeof value === "string") {
		return formatDateValue(value);
	}
	if (field.type === "blood_pressure") {
		if (typeof value !== "string" || !value.trim()) return "—";
		return `${value} mmHg`;
	}
	if (typeof value === "string") {
		return value.trim() ? value : "—";
	}
	return String(value);
};

export default function HealthOverviewScreen() {
	const accent = useThemeColor("accent");
	const [recapOpen, setRecapOpen] = useState(false);
	const [recapSelectedIds, setRecapSelectedIds] = useState(
		RECAP_SECTIONS.map((section) => section.id),
	);
	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
	});
	const data = healthQuery.data?.data ?? {};
	const personalInfo =
		(data?.personal_information as Record<string, FieldValue> | undefined) ??
		{};
	const sexValue = personalInfo.biological_sex;
	const visibleCategories = filterHealthCategoriesBySex(
		healthCategories,
		typeof sexValue === "string" ? sexValue : null,
	);

	return (
		<Container className="px-6 pt-6 pb-12">
			<Stack.Screen
				options={{
					title: "Medical record",
					headerRight: () => (
						<HorizontalStack className="gap-1">
							<Pressable
								onPress={() => setRecapOpen(true)}
								className="h-9 w-9 items-center justify-center rounded-full"
								style={pressableFeedback()}
								accessibilityRole="button"
								accessibilityLabel="Share recap"
							>
								<Ionicons
									name="share-social-outline"
									size={20}
									color={accent}
								/>
							</Pressable>
							<Pressable
								onPress={() => router.push("/health")}
								className="h-9 w-9 items-center justify-center rounded-full"
								style={pressableFeedback()}
								accessibilityRole="button"
								accessibilityLabel="Edit medical record"
							>
								<Ionicons name="create-outline" size={20} color={accent} />
							</Pressable>
						</HorizontalStack>
					),
				}}
			/>
			<VerticalStack>
				<MedicalSummaryCard data={data} />
				{visibleCategories.map((category) => {
					const categoryValues =
						(data?.[category.key] as Record<string, FieldValue> | undefined) ??
						{};
					const hasAnyValue = Object.values(categoryValues ?? {}).some(
						(value) =>
							value != null &&
							((Array.isArray(value) && value.length > 0) ||
								(typeof value === "string" && value.trim().length > 0)),
					);

					return (
						<Card key={category.key}>
							<CardHeader>
								<CardTitle>{category.label}</CardTitle>
							</CardHeader>
							<CardBody className="gap-3">
								{Object.entries(category.fields).map(([fieldKey, field]) => {
									const fieldValue = categoryValues[fieldKey];
									const displayValue = formatFieldValue(
										field,
										fieldValue,
										categoryValues,
										fieldKey,
									);
									return (
										<View key={`${category.key}-${fieldKey}`} className="gap-1">
											<Caption>{field.label}</Caption>
											<BodyStrong>{displayValue}</BodyStrong>
										</View>
									);
								})}
								{!hasAnyValue ? (
									<Body className="text-muted">No information added yet.</Body>
								) : null}
							</CardBody>
						</Card>
					);
				})}
			</VerticalStack>
			<RecapBuilderModal
				open={recapOpen}
				onClose={() => setRecapOpen(false)}
				sections={RECAP_SECTIONS}
				selectedIds={recapSelectedIds}
				onSelectedIdsChange={setRecapSelectedIds}
			/>
		</Container>
	);
}
