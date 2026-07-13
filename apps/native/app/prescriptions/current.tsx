import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { Caption } from "@/components/base/typography";
import { InteractionAlert } from "@/components/features/prescription/interaction-alert";
import {
	TreatmentListItem,
	type TreatmentMedication,
} from "@/components/features/prescription/treatment-list-item";
import { UnifiedPrescriptionEmpty } from "@/components/features/prescription/unified-prescription-empty/unified-prescription-empty";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { trpc } from "@/utils/trpc";

function formatSchedule(medication: TreatmentMedication) {
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

function TreatmentList({
	medications,
	dimmed,
}: {
	medications: TreatmentMedication[];
	dimmed?: boolean;
}) {
	return (
		<View>
			{medications.map((medication, index) => (
				<View
					key={`${medication.name}-${medication.dosage ?? ""}`}
					className={index > 0 ? "border-panel-border border-t" : undefined}
				>
					<TreatmentListItem
						medication={medication}
						schedule={formatSchedule(medication)}
						dimmed={dimmed}
						onPress={() =>
							router.push({
								pathname: "/prescriptions/treatment/[id]",
								params: {
									id: encodeURIComponent(medication.name),
									dosage: encodeURIComponent(medication.dosage ?? ""),
								},
							})
						}
					/>
				</View>
			))}
		</View>
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
		[]) as TreatmentMedication[];
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
							<TreatmentList medications={activeMedications} />
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
							<TreatmentList medications={endedMedications} dimmed />
						</CardBody>
					</Card>
				) : null}
			</VerticalStack>
		</Container>
	);
}
