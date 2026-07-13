import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// One schedule entry per (medication, moment[, day]) — mirrors the server's
// computed schedule shape (packages/domain reminders service).
export type ScheduleEntry = {
	medicationName: string;
	medicationDosage: string | null;
	moment: string;
	// "HH:mm" 24h local time.
	time: string;
	// Empty = every day. Otherwise 0=Sunday..6=Saturday.
	daysOfWeek: number[];
};

const REMINDER_DATA_TYPE = "medication-reminder";
const ANDROID_CHANNEL_ID = "medication-reminders";

// Foreground presentation: show the banner even when the app is open.
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export type PermissionState = "granted" | "denied" | "undetermined";

function toPermissionState(
	status: Notifications.PermissionStatus,
	canAskAgain: boolean,
): PermissionState {
	if (status === "granted") return "granted";
	if (status === "undetermined" && canAskAgain) return "undetermined";
	return "denied";
}

export async function getPermissionState(): Promise<PermissionState> {
	const { status, canAskAgain } = await Notifications.getPermissionsAsync();
	return toPermissionState(status, canAskAgain);
}

/**
 * Request notification permission when needed. Returns the resulting state.
 */
export async function ensurePermission(): Promise<PermissionState> {
	const current = await Notifications.getPermissionsAsync();
	if (current.status === "granted") return "granted";
	if (!current.canAskAgain) return "denied";
	const requested = await Notifications.requestPermissionsAsync();
	return toPermissionState(requested.status, requested.canAskAgain);
}

async function ensureAndroidChannel() {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
		name: "Medication reminders",
		importance: Notifications.AndroidImportance.HIGH,
		lightColor: "#0d9488",
	});
}

function parseTime(time: string) {
	const [hourStr, minuteStr] = time.split(":");
	const hour = Number.parseInt(hourStr ?? "", 10);
	const minute = Number.parseInt(minuteStr ?? "", 10);
	if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
	return { hour, minute };
}

/**
 * Cancel only the notifications this feature scheduled (identified by data
 * type), leaving any other app notifications untouched.
 */
export async function cancelReminderNotifications() {
	const scheduled = await Notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduled
			.filter((item) => item.content.data?.type === REMINDER_DATA_TYPE)
			.map((item) =>
				Notifications.cancelScheduledNotificationAsync(item.identifier),
			),
	);
}

function buildTriggers(
	entry: ScheduleEntry,
	hour: number,
	minute: number,
): Notifications.NotificationTriggerInput[] {
	if (!entry.daysOfWeek.length) {
		return [
			{
				type: Notifications.SchedulableTriggerInputTypes.DAILY,
				hour,
				minute,
			},
		];
	}
	// expo weekday: 1=Sunday..7=Saturday; our daysOfWeek: 0=Sunday..6=Saturday.
	return entry.daysOfWeek.map((dow) => ({
		type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
		weekday: ((dow % 7) + 7) % 7 === 0 ? 1 : (dow % 7) + 1,
		hour,
		minute,
	}));
}

function buildBody(entry: ScheduleEntry) {
	return entry.medicationDosage
		? `${entry.medicationName} · ${entry.medicationDosage}`
		: entry.medicationName;
}

/**
 * Reconcile scheduled OS notifications with the given schedule: cancel our
 * existing ones and (re)schedule from scratch. Repeating calendar triggers keep
 * the pending count small (one per moment, not per day).
 */
export async function syncScheduledNotifications(schedule: ScheduleEntry[]) {
	await ensureAndroidChannel();
	await cancelReminderNotifications();

	for (const entry of schedule) {
		const parsed = parseTime(entry.time);
		if (!parsed) continue;
		const triggers = buildTriggers(entry, parsed.hour, parsed.minute);
		for (const trigger of triggers) {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "Time for your medication",
					body: buildBody(entry),
					sound: true,
					data: {
						type: REMINDER_DATA_TYPE,
						medicationName: entry.medicationName,
						medicationDosage: entry.medicationDosage,
						moment: entry.moment,
					},
					...(Platform.OS === "android"
						? { channelId: ANDROID_CHANNEL_ID }
						: {}),
				},
				trigger,
			});
		}
	}
}
