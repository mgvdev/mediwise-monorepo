import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { View } from "react-native";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { Body, Caption } from "@/components/base/typography";
import { MedicationListItem } from "@/components/features/prescription/medication-list-item";
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
    startDate?: string | null;
    endDate?: string | null;
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

export default function CurrentTreatmentsScreen() {
    const currentQuery = useQuery({
        ...trpc.prescriptions.unified.current.queryOptions(),
    });
    const medications = currentQuery.data?.medications ?? [];

    return (
        <Container className="px-6 pt-6 pb-12">
            <Stack.Screen options={{ title: "Current treatments" }} />
            <Card>
                <CardHeader>
                    <CardTitle>Active treatments</CardTitle>
                </CardHeader>
                <CardBody>
                    {medications.length ? (
                        <VerticalStack className="gap-3">
                            {medications.map((medication) => (
                                <MedicationListItem
                                    key={`${medication.name}-${medication.dosage ?? ""}`}
                                    medication={{
                                        id: `${medication.name}-${medication.dosage ?? ""}`,
                                        name: medication.name,
                                        dosage: medication.dosage ?? "",
                                        frequencyCount:
                                            medication.frequencyCount
                                                ? String(
                                                      medication.frequencyCount,
                                                  )
                                                : "",
                                        frequencyUnit:
                                            medication.frequencyUnit ?? "day",
                                        durationType:
                                            medication.durationType ??
                                            "one_off",
                                        durationValue: medication.durationValue
                                            ? String(medication.durationValue)
                                            : "",
                                        durationUnit:
                                            medication.durationUnit ?? "day",
                                        instructions:
                                            medication.instructions ?? null,
                                        route: null,
                                        frequencyText:
                                            medication.frequency ?? undefined,
                                        durationText: undefined,
                                        comment: "",
                                    }}
                                    schedule={formatSchedule(medication)}
                                    comment={formatDatesLine(medication)}
                                    display={{
                                        schedule: true,
                                        details: true,
                                        comment: true,
                                    }}
                                    variant="compact"
                                    enableEditor={false}
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
                                We will keep this list updated as new
                                prescriptions are processed.
                            </Caption>
                        </View>
                    )}
                </CardBody>
            </Card>
        </Container>
    );
}
