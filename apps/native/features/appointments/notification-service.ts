import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Mirrors the server's computed schedule shape
// (packages/domain appointments service).
export type AppointmentScheduleEntry = {
	appointmentId: string;
	title: string;
	body: string;
	/** ISO 8601 UTC instant at which the notification fires. */
	triggerAt: string;
};

export const APPOINTMENT_DATA_TYPE = "appointment-reminder";
const ANDROID_CHANNEL_ID = "appointment-reminders";

async function ensureAndroidChannel() {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
		name: "Appointment reminders",
		importance: Notifications.AndroidImportance.HIGH,
		lightColor: "#0d9488",
	});
}

/**
 * Cancel only the notifications this feature scheduled, leaving medication
 * reminders untouched.
 */
export async function cancelAppointmentNotifications() {
	const scheduled = await Notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduled
			.filter((item) => item.content.data?.type === APPOINTMENT_DATA_TYPE)
			.map((item) =>
				Notifications.cancelScheduledNotificationAsync(item.identifier),
			),
	);
}

async function runSync(schedule: AppointmentScheduleEntry[]) {
	await ensureAndroidChannel();
	await cancelAppointmentNotifications();

	const now = Date.now();
	for (const entry of schedule) {
		const date = new Date(entry.triggerAt);
		if (Number.isNaN(date.getTime()) || date.getTime() <= now) continue;
		await Notifications.scheduleNotificationAsync({
			content: {
				title: entry.title,
				body: entry.body,
				sound: true,
				data: {
					type: APPOINTMENT_DATA_TYPE,
					appointmentId: entry.appointmentId,
				},
				...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL_ID } : {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date,
			},
		});
	}
}

let pendingSync: Promise<void> = Promise.resolve();

/**
 * Reconcile OS notifications with the given schedule: cancel ours and
 * re-schedule from scratch. One one-shot DATE trigger per appointment.
 *
 * Serialized behind a module-level promise chain: this is a read-modify-write
 * over the shared OS notification queue (list all -> cancel ours ->
 * re-schedule), so overlapping callers (schedule-changed effect and the
 * AppState-foreground effect) must not interleave or they can duplicate
 * notifications.
 */
export function syncAppointmentNotifications(
	schedule: AppointmentScheduleEntry[],
) {
	pendingSync = pendingSync.then(() => runSync(schedule)).catch(() => {});
	return pendingSync;
}
