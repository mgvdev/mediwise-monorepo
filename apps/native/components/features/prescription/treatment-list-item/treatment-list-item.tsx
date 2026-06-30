import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { DotChip } from "@/components/base/dot-chip";
import {
	formatIntakeMoments,
	formatMedicationForm,
} from "@/components/features/prescription/prescription-types";

export type TreatmentMedication = {
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

function TreatmentBadges({ medication }: { medication: TreatmentMedication }) {
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

type TreatmentListItemProps = {
	medication: TreatmentMedication;
	schedule?: string;
	dimmed?: boolean;
	onPress?: () => void;
};

export function TreatmentListItem({
	medication,
	schedule,
	dimmed = false,
	onPress,
}: TreatmentListItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"flex-row items-stretch gap-3 py-3",
				dimmed && "opacity-70",
			)}
		>
			<View
				className={cn(
					"w-1 self-stretch rounded-full",
					dimmed ? "bg-muted/40" : "bg-success",
				)}
			/>
			<View className="flex-1 gap-1.5">
				<View className="flex-row items-center gap-2">
					<View className="flex-1 flex-row items-baseline gap-2">
						<Text
							className="text-foreground text-base font-semibold"
							numberOfLines={1}
						>
							{medication.name}
						</Text>
						{medication.dosage ? (
							<Text className="text-muted text-sm">{medication.dosage}</Text>
						) : null}
					</View>
					<Ionicons name="chevron-forward" size={16} className="text-muted" />
				</View>
				{schedule ? (
					<Text className="text-primary text-xs">{schedule}</Text>
				) : null}
				<TreatmentBadges medication={medication} />
			</View>
		</Pressable>
	);
}
