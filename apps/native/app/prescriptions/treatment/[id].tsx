import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { View, Text } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { DotChip } from "@/components/base/dot-chip";
import {
	Body,
	BodyMuted,
	Caption,
	Display,
	Micro,
	Overline,
	Subtitle,
} from "@/components/base/typography";
import {
	formatIntakeMoments,
	formatMedicationForm,
} from "@/components/features/prescription/prescription-types";
import { type TreatmentMedication } from "@/components/features/prescription/treatment-list-item";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { trpc } from "@/utils/trpc";

const PRIMARY_ICON = "#0d9488";

function formatFrequencySchedule(medication: TreatmentMedication) {
	const parts: string[] = [];
	if (medication.frequencyCount && medication.frequencyUnit) {
		parts.push(`${medication.frequencyCount}x/${medication.frequencyUnit}`);
	}
	if (
		medication.durationType === "one_off" &&
		medication.durationValue &&
		medication.durationUnit
	) {
		const plural = medication.durationValue === 1 ? "" : "s";
		parts.push(
			`for ${medication.durationValue} ${medication.durationUnit}${plural}`,
		);
	}
	return parts.join(" • ");
}

function Pill({
	label,
	icon,
	className,
}: {
	label: string;
	icon?: string;
	className?: string;
}) {
	return (
		<View
			className={cn(
				"border-primary/20 bg-primary/10 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
				className,
			)}
		>
			{icon ? (
				<Ionicons
					name={icon as React.ComponentProps<typeof Ionicons>["name"]}
					size={12}
					color={PRIMARY_ICON}
				/>
			) : null}
			<Text className="text-primary text-xs font-semibold">{label}</Text>
		</View>
	);
}

function SectionCard({
	icon,
	title,
	children,
}: {
	icon: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="gap-3">
				<View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-xl">
					<Ionicons
						name={icon as React.ComponentProps<typeof Ionicons>["name"]}
						size={18}
						color={PRIMARY_ICON}
					/>
				</View>
				<CardTitle className="text-foreground">{title}</CardTitle>
			</CardHeader>
			<CardBody className="mt-2 gap-3">{children}</CardBody>
		</Card>
	);
}

function StatCard({
	icon,
	value,
	label,
}: {
	icon: string;
	value: string;
	label: string;
}) {
	return (
		<Card className="flex-1 items-center gap-2 py-4">
			<View className="bg-primary/10 h-10 w-10 items-center justify-center rounded-full">
				<Ionicons
					name={icon as React.ComponentProps<typeof Ionicons>["name"]}
					size={18}
					color={PRIMARY_ICON}
				/>
			</View>
			<Caption className="text-foreground text-center font-semibold">
				{value}
			</Caption>
			<Micro>{label}</Micro>
		</Card>
	);
}

function DetailRow({
	icon,
	label,
	value,
}: {
	icon: string;
	label: string;
	value?: string | null;
}) {
	if (!value?.trim()) return null;
	return (
		<View className="flex-row items-start gap-3">
			<View className="mt-0.5">
				<Ionicons
					name={icon as React.ComponentProps<typeof Ionicons>["name"]}
					size={16}
					color={PRIMARY_ICON}
				/>
			</View>
			<View className="flex-1 gap-0.5">
				<Caption>{label}</Caption>
				<Body>{value}</Body>
			</View>
		</View>
	);
}

export default function TreatmentDetailScreen() {
	const params = useLocalSearchParams<{
		id?: string | string[];
		dosage?: string | string[];
	}>();
	const name = decodeURIComponent(
		Array.isArray(params.id) ? params.id[0] : (params.id ?? ""),
	);
	const dosage = decodeURIComponent(
		Array.isArray(params.dosage) ? params.dosage[0] : (params.dosage ?? ""),
	);

	const unifiedQuery = useQuery({
		...trpc.prescriptions.unified.get.queryOptions(),
	});
	const medications = (unifiedQuery.data?.medications ??
		[]) as TreatmentMedication[];
	const medication = medications.find(
		(m) => m.name === name && (m.dosage ?? "") === dosage,
	);

	if (!name || !medication) {
		return <Redirect href="/prescriptions/current" />;
	}

	const schedule = formatFrequencySchedule(medication);
	const form = formatMedicationForm(medication.form);
	const moments = formatIntakeMoments(medication.intakeMoments);
	const isEnded = medication.status === "ended";

	const frequencyValue = medication.frequencyCount
		? `${medication.frequencyCount}x / ${medication.frequencyUnit}`
		: (medication.frequency ?? "—");
	const durationValue =
		medication.durationType === "chronic"
			? "Chronic"
			: medication.durationValue && medication.durationUnit
				? `${medication.durationValue} ${medication.durationUnit}${medication.durationValue === 1 ? "" : "s"}`
				: "—";

	return (
		<Container className="px-5 pt-6 pb-12">
			<Stack.Screen options={{ title: medication.name }} />

			<VerticalStack className="gap-5">
				<View
					className={cn(
						"border-primary/10 rounded-3xl border p-5",
						"from-primary/20 via-primary/5 to-panel-background bg-gradient-to-br",
						isEnded && "opacity-80",
					)}
				>
					<View className="flex-row items-start justify-between gap-4">
						<View className="flex-1 gap-2">
							<Overline className="text-primary/80">TREATMENT</Overline>
							<Display className="text-foreground">{medication.name}</Display>
							{medication.dosage ? (
								<Subtitle>{medication.dosage}</Subtitle>
							) : null}
						</View>
						<View className="bg-primary/15 h-14 w-14 items-center justify-center rounded-2xl shadow-sm">
							<Ionicons name="medkit-outline" size={28} color={PRIMARY_ICON} />
						</View>
					</View>

					<View className="mt-4 flex-row flex-wrap items-center gap-2">
						<DotChip
							status={isEnded ? "warning" : "normal"}
							label={isEnded ? "Ended" : "Active"}
						/>
						{medication.durationType ? (
							<Pill
								label={
									medication.durationType === "chronic" ? "Chronic" : "One-off"
								}
								icon="time-outline"
							/>
						) : null}
						{schedule ? (
							<Pill label={schedule} icon="calendar-outline" />
						) : null}
					</View>
				</View>

				<View className="flex-row gap-3">
					<StatCard
						icon="repeat-outline"
						value={frequencyValue}
						label="Frequency"
					/>
					<StatCard
						icon="hourglass-outline"
						value={durationValue}
						label="Duration"
					/>
					<StatCard icon="layers-outline" value={form ?? "—"} label="Form" />
				</View>

				<SectionCard icon="alarm-outline" title="Intake moments">
					{moments.length ? (
						<View className="flex-row flex-wrap gap-2">
							{moments.map((moment) => (
								<Pill key={moment} label={moment} icon="sunny-outline" />
							))}
						</View>
					) : (
						<BodyMuted>No intake moments specified.</BodyMuted>
					)}
				</SectionCard>

				<SectionCard icon="information-circle-outline" title="Instructions">
					{medication.instructions?.trim() ? (
						<Body>{medication.instructions}</Body>
					) : (
						<BodyMuted>No instructions provided.</BodyMuted>
					)}
				</SectionCard>

				<SectionCard icon="document-text-outline" title="Treatment details">
					<View className="gap-3">
						<DetailRow
							icon="git-branch-outline"
							label="Route"
							value={medication.route}
						/>
						<DetailRow
							icon="calendar-clear-outline"
							label="Start date"
							value={medication.startDate}
						/>
						<DetailRow
							icon="flag-outline"
							label="End date"
							value={medication.endDate}
						/>
					</View>
				</SectionCard>
			</VerticalStack>
		</Container>
	);
}
