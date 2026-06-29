import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { DotChip } from "@/components/base/dot-chip";
import { Caption } from "@/components/base/typography";
import { InteractionAlert } from "@/components/features/prescription/interaction-alert";
import { MedicationListItem } from "@/components/features/prescription/medication-list-item";
import {
	formatIntakeMoments,
	formatMedicationForm,
} from "@/components/features/prescription/prescription-types";
import { UnifiedPrescriptionEmpty } from "@/components/features/prescription/unified-prescription-empty/unified-prescription-empty";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { trpc } from "@/utils/trpc";

type CurrentMedication = {
	name: string;
	dosage?: string | null;
	frequency?: string | null;
	frequencyCount?: number | null;
	frequencyUnit?: "day" | "week" | "month" | null;
	durationType?: "one_off" | "chronic" | null;
	durationValue?: number | null;
	durationUnit?: "day" | "week" | "month" | null;
	instructions?: string | null;
	form?: string | null;
	intakeMoments?: string[] | null;
	startDate?: string | null;
	endDate?: string | null;
	status?: "active" | "ended";
};

function formatSchedule(medication: CurrentMedication) {
	const parts: string[] = [];
	if (medication.frequencyCount && medication.frequencyUnit) {
		parts.push(`${medication.frequencyCount}x/${medication.frequencyUnit}`);
	}
	if (medication.durationType === "chronic") {
		parts.push("Chronic");
	} else if (medication.durationValue && medication.durationUnit) {
		const plural = medication.durationValue === 1 ? "" : "s";
		parts.push(
			`for ${medication.durationValue} ${medication.durationUnit}${plural}`,
		);
	}
	return parts.join(" • ");
}

function formatDatesLine(medication: CurrentMedication) {
	const parts: string[] = [];
	if (medication.startDate) {
		const start = new Date(medication.startDate);
		if (!Number.isNaN(start.getTime())) {
			parts.push(`Start ${start.toLocaleDateString()}`);
		}
	}
	if (medication.endDate) {
		const end = new Date(medication.endDate);
		if (!Number.isNaN(end.getTime())) {
			parts.push(`End ${end.toLocaleDateString()}`);
		}
	}
	return parts.join(" • ");
}

function Pill({
	label,
	tone = "neutral",
}: {
	label: string;
	tone?: "neutral" | "accent";
}) {
	return (
		<View
			className={cn(
				"rounded-full border px-2.5 py-1",
				tone === "accent"
					? "border-primary/40 bg-primary/10"
					: "border-panel-border bg-surface/40",
			)}
		>
			<Text
				className={cn(
					"text-xs font-medium",
					tone === "accent" ? "text-primary" : "text-muted",
				)}
			>
				{label}
			</Text>
		</View>
	);
}

function MedicationBadges({ medication }: { medication: CurrentMedication }) {
	const form = formatMedicationForm(medication.form);
	const moments = formatIntakeMoments(medication.intakeMoments);
	const isChronic = medication.durationType === "chronic";

	return (
		<View className="flex-row flex-wrap items-center gap-2">
			{medication.status === "ended" ? (
				<DotChip status="warning" label="Terminé" />
			) : (
				<DotChip status="normal" label="Actif" />
			)}
			{medication.durationType ? (
				<Pill
					label={isChronic ? "Chronique" : "Ponctuel"}
					tone={isChronic ? "accent" : "neutral"}
				/>
			) : null}
			{form ? <Pill label={form} /> : null}
			{moments.map((moment) => (
				<Pill key={moment} label={moment} />
			))}
		</View>
	);
}

function MedicationRow({ medication }: { medication: CurrentMedication }) {
	return (
		<MedicationListItem
			key={`${medication.name}-${medication.dosage ?? ""}`}
			medication={{
				id: `${medication.name}-${medication.dosage ?? ""}`,
				name: medication.name,
				dosage: medication.dosage ?? "",
				frequencyCount: medication.frequencyCount
					? String(medication.frequencyCount)
					: "",
				frequencyUnit: medication.frequencyUnit ?? "day",
				durationType: medication.durationType ?? "one_off",
				durationValue: medication.durationValue
					? String(medication.durationValue)
					: "",
				durationUnit: medication.durationUnit ?? "day",
				instructions: medication.instructions ?? null,
				route: null,
				frequencyText: medication.frequency ?? undefined,
				durationText: undefined,
				comment: "",
				form: medication.form ?? null,
				intakeMoments: medication.intakeMoments ?? [],
			}}
			schedule={formatSchedule(medication)}
			comment={formatDatesLine(medication)}
			display={{ schedule: true, details: true, comment: true }}
			variant="compact"
			enableEditor={false}
			footer={<MedicationBadges medication={medication} />}
		/>
	);
}

export default function CurrentTreatmentsScreen() {
	const unifiedQuery = useQuery({
		...trpc.prescriptions.unified.get.queryOptions(),
	});
	const interactionsQuery = useQuery({
		...trpc.prescriptions.unified.interactions.queryOptions(),
	});
	const medications = (unifiedQuery.data?.medications ??
		[]) as CurrentMedication[];
	const activeMedications = medications.filter(
		(medication) => medication.status !== "ended",
	);
	const endedMedications = medications.filter(
		(medication) => medication.status === "ended",
	);
	const interactions = interactionsQuery.data?.items ?? [];

	return (
		<Container className="px-6 pt-6 pb-12">
			<Stack.Screen options={{ title: "Current treatments" }} />
			<VerticalStack className="gap-4">
				<InteractionAlert
					items={interactions}
					disclaimer={interactionsQuery.data?.disclaimer}
				/>
				<Card>
					<CardHeader>
						<CardTitle>Active treatments</CardTitle>
					</CardHeader>
					<CardBody>
						{activeMedications.length ? (
							<VerticalStack className="gap-3">
								{activeMedications.map((medication) => (
									<MedicationRow
										key={`${medication.name}-${medication.dosage ?? ""}`}
										medication={medication}
									/>
								))}
							</VerticalStack>
						) : (
							<View className="gap-2">
								<UnifiedPrescriptionEmpty
									title="No active treatments"
									description="Upload or add a prescription to see active treatments."
								/>
								<Caption>
									We will keep this list updated as new prescriptions are
									processed.
								</Caption>
							</View>
						)}
					</CardBody>
				</Card>

				{endedMedications.length ? (
					<Card>
						<CardHeader>
							<CardTitle>Past treatments</CardTitle>
						</CardHeader>
						<CardBody>
							<VerticalStack className="gap-3">
								{endedMedications.map((medication) => (
									<MedicationRow
										key={`${medication.name}-${medication.dosage ?? ""}`}
										medication={medication}
									/>
								))}
							</VerticalStack>
						</CardBody>
					</Card>
				) : null}
			</VerticalStack>
		</Container>
	);
}
