import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Linking, Pressable, View } from "react-native";

import {
	Card,
	CardAction,
	CardBody,
	CardHeader,
	CardTitle,
} from "@/components/base/card";
import { DotChip } from "@/components/base/dot-chip";
import {
	Body,
	BodyMuted,
	BodyStrong,
	Caption,
	Micro,
} from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { applyOpacity } from "@/components/utils";
import type { ScheduleEntry } from "@/features/reminders/notification-service";
import { ensurePermission } from "@/features/reminders/notification-service";
import {
	usePermissionState,
	useRemindersQuery,
} from "@/features/reminders/use-reminders";
import {
	formatMomentLabel,
	getTodaySchedule,
} from "@/features/reminders/utils";

type ReminderRow = {
	medicationName: string;
	medicationDosage: string | null;
	enabled: boolean;
	moments: string[];
	medicationActive: boolean;
};

function medMatches(entry: ScheduleEntry, reminder: ReminderRow) {
	return (
		entry.medicationName === reminder.medicationName &&
		(entry.medicationDosage ?? "") === (reminder.medicationDosage ?? "")
	);
}

function PermissionBanner({ state }: { state: "denied" | "undetermined" }) {
	const primary = useThemeColor("accent");
	return (
		<Card>
			<CardBody className="gap-3">
				<View className="flex-row items-center gap-3">
					<View
						className="h-10 w-10 items-center justify-center rounded-full"
						style={{
							backgroundColor: applyOpacity(primary, 0.12) ?? "transparent",
						}}
					>
						<Ionicons name="notifications-outline" size={18} color={primary} />
					</View>
					<View className="flex-1">
						<BodyStrong>Enable notifications</BodyStrong>
						<Caption>
							Reminders can't alert you until notifications are on.
						</Caption>
					</View>
				</View>
				<Pressable
					onPress={() =>
						state === "denied" ? Linking.openSettings() : ensurePermission()
					}
					className="rounded-xl py-3"
					style={{ backgroundColor: primary }}
				>
					<Body className="text-center font-semibold text-white">
						{state === "denied" ? "Open settings" : "Allow notifications"}
					</Body>
				</Pressable>
			</CardBody>
		</Card>
	);
}

function TodayCard({ schedule }: { schedule: ScheduleEntry[] }) {
	const today = getTodaySchedule(schedule);
	if (!today.length) return null;
	return (
		<Card>
			<CardHeader>
				<CardTitle>Today</CardTitle>
			</CardHeader>
			<CardBody className="mt-1">
				{today.map((entry, index) => (
					<View
						key={`${entry.medicationName}-${entry.moment}-${entry.time}`}
						className={
							index > 0
								? "border-panel-border flex-row items-center gap-3 border-t py-2.5"
								: "flex-row items-center gap-3 py-2.5"
						}
					>
						<BodyStrong className="text-primary w-14">{entry.time}</BodyStrong>
						<View className="flex-1">
							<Body numberOfLines={1}>{entry.medicationName}</Body>
							<Micro>{formatMomentLabel(entry.moment)}</Micro>
						</View>
					</View>
				))}
			</CardBody>
		</Card>
	);
}

function ReminderListRow({
	reminder,
	schedule,
}: {
	reminder: ReminderRow;
	schedule: ScheduleEntry[];
}) {
	const times = schedule
		.filter((entry) => medMatches(entry, reminder))
		.map((entry) => `${formatMomentLabel(entry.moment)} ${entry.time}`);

	return (
		<Pressable
			onPress={() =>
				router.push({
					pathname: "/reminders/[med]",
					params: {
						med: encodeURIComponent(reminder.medicationName),
						dosage: encodeURIComponent(reminder.medicationDosage ?? ""),
					},
				})
			}
			className="flex-row items-center gap-3 py-3"
		>
			<View className="flex-1 gap-1.5">
				<View className="flex-row items-center gap-2">
					<BodyStrong numberOfLines={1}>{reminder.medicationName}</BodyStrong>
					{reminder.medicationDosage ? (
						<Caption>{reminder.medicationDosage}</Caption>
					) : null}
				</View>
				<View className="flex-row flex-wrap items-center gap-2">
					<DotChip
						status={reminder.enabled ? "normal" : "warning"}
						label={reminder.enabled ? "On" : "Off"}
					/>
					{!reminder.medicationActive ? (
						<Caption>Inactive treatment</Caption>
					) : times.length ? (
						<Caption>{times.join(" · ")}</Caption>
					) : (
						<Caption>No times set</Caption>
					)}
				</View>
			</View>
			<Ionicons name="chevron-forward" size={16} className="text-muted" />
		</Pressable>
	);
}

export default function RemindersScreen() {
	const primary = useThemeColor("accent");
	const permission = usePermissionState();
	const query = useRemindersQuery();

	const reminders = (query.data?.reminders ?? []) as ReminderRow[];
	const schedule = (query.data?.schedule ?? []) as ScheduleEntry[];
	const activeReminders = reminders.filter((r) => r.medicationActive);
	const inactiveReminders = reminders.filter((r) => !r.medicationActive);

	return (
		<Container className="px-6 pt-6 pb-12">
			<Stack.Screen
				options={{
					title: "Treatment reminders",
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/reminders/settings")}
							hitSlop={12}
							accessibilityRole="button"
							accessibilityLabel="Reminder times"
						>
							<Ionicons name="options-outline" size={20} color={primary} />
						</Pressable>
					),
				}}
			/>
			<VerticalStack className="gap-4">
				{permission !== "granted" ? (
					<PermissionBanner state={permission} />
				) : null}

				<TodayCard schedule={schedule} />

				<Card>
					<CardHeader>
						<CardTitle>Medications</CardTitle>
						<CardAction
							onPress={() => router.push("/reminders/settings")}
							accessibilityRole="button"
							accessibilityLabel="Reminder times"
						>
							<Ionicons name="time-outline" size={16} color={primary} />
						</CardAction>
					</CardHeader>
					<CardBody className="mt-1">
						{activeReminders.length ? (
							activeReminders.map((reminder, index) => (
								<View
									key={`${reminder.medicationName}-${reminder.medicationDosage ?? ""}`}
									className={
										index > 0 ? "border-panel-border border-t" : undefined
									}
								>
									<ReminderListRow reminder={reminder} schedule={schedule} />
								</View>
							))
						) : (
							<View className="gap-2 py-2">
								<BodyStrong>No reminders yet</BodyStrong>
								<BodyMuted>
									Add a treatment and turn on its reminder to see it here.
								</BodyMuted>
								<Pressable
									onPress={() => router.push("/prescriptions/current")}
									className="mt-1"
								>
									<Body className="text-primary font-semibold">
										View current treatments
									</Body>
								</Pressable>
							</View>
						)}
					</CardBody>
				</Card>

				{inactiveReminders.length ? (
					<Card>
						<CardHeader>
							<CardTitle>Inactive treatments</CardTitle>
						</CardHeader>
						<CardBody className="mt-1">
							{inactiveReminders.map((reminder, index) => (
								<View
									key={`${reminder.medicationName}-${reminder.medicationDosage ?? ""}`}
									className={
										index > 0
											? "border-panel-border border-t opacity-70"
											: "opacity-70"
									}
								>
									<ReminderListRow reminder={reminder} schedule={schedule} />
								</View>
							))}
						</CardBody>
					</Card>
				) : null}
			</VerticalStack>
		</Container>
	);
}
