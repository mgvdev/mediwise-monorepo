import { View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { BodyStrong, Caption } from "@/components/base/typography";

type FieldValue = string | string[] | null | undefined;
type HealthDataMap = Record<string, Record<string, FieldValue> | undefined>;

const CONDITION_CATEGORIES = [
	"cardiology",
	"pulmonology",
	"neurology",
	"endocrinology",
	"psychiatry",
] as const;

const asString = (value: FieldValue) =>
	typeof value === "string" && value.trim() ? value.trim() : null;

function getAge(birthISO: FieldValue) {
	const iso = asString(birthISO);
	if (!iso) return null;
	const birth = new Date(iso);
	if (Number.isNaN(birth.getTime())) return null;
	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();
	const monthDiff = now.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age >= 0 ? age : null;
}

function countActiveConditions(data: HealthDataMap) {
	let count = 0;
	for (const key of CONDITION_CATEGORIES) {
		const category = data[key] ?? {};
		for (const value of Object.values(category)) {
			if (value === "yes") count += 1;
		}
	}
	return count;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<View className="gap-1">
			<Caption>{label}</Caption>
			<BodyStrong>{value}</BodyStrong>
		</View>
	);
}

export function MedicalSummaryCard({ data }: { data: HealthDataMap }) {
	const personal = data.personal_information ?? {};
	const vitals = data.vital_signs ?? {};
	const allergies = data.allergies ?? {};

	const firstName = asString(personal.first_name);
	const lastName = asString(personal.last_name);
	const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";

	const age = getAge(personal.birth_date);
	const sex = asString(personal.biological_sex);
	const ageSex = [age != null ? `${age} yrs` : null, sex]
		.filter(Boolean)
		.join(" · ");

	const bloodGroup = asString(personal.blood_group) ?? "—";

	const height = asString(personal.height_cm);
	const weight = asString(personal.weight_kg);
	const measurements =
		[height ? `${height} cm` : null, weight ? `${weight} kg` : null]
			.filter(Boolean)
			.join(" · ") || "—";

	const bloodPressure = asString(vitals.blood_pressure);
	const bloodPressureLabel = bloodPressure ? `${bloodPressure} mmHg` : "—";

	const allergyList = Array.isArray(allergies.details)
		? allergies.details.filter(Boolean)
		: [];
	const allergyLabel = allergyList.length ? allergyList.join(", ") : "None";

	const conditionCount = countActiveConditions(data);
	const conditionLabel =
		conditionCount > 0
			? `${conditionCount} condition${conditionCount > 1 ? "s" : ""}`
			: "None";

	return (
		<Card>
			<CardHeader>
				<CardTitle>{fullName}</CardTitle>
			</CardHeader>
			<CardBody className="gap-3">
				{ageSex ? <Caption>{ageSex}</Caption> : null}
				<View className="flex-row flex-wrap gap-y-3">
					<View className="w-1/2 pr-2">
						<SummaryRow label="Blood group" value={bloodGroup} />
					</View>
					<View className="w-1/2 pr-2">
						<SummaryRow label="Blood pressure" value={bloodPressureLabel} />
					</View>
					<View className="w-1/2 pr-2">
						<SummaryRow label="Height / weight" value={measurements} />
					</View>
					<View className="w-1/2 pr-2">
						<SummaryRow label="Conditions" value={conditionLabel} />
					</View>
					<View className="w-full">
						<SummaryRow label="Allergies" value={allergyLabel} />
					</View>
				</View>
			</CardBody>
		</Card>
	);
}
