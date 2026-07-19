// Pure appointment logic: turning stored appointments into the flat reminder
// schedule the native client hands straight to expo-notifications. No IO here —
// the tRPC service layer fetches the appointments (see api/routers/appointments).

/** One day before the appointment, the default offered in the form. */
export const DEFAULT_REMINDER_OFFSET_MINUTES = 1440;

export type ScheduleAppointment = {
	id: string;
	startAt: Date;
	practitionerName?: string | null;
	reason?: string | null;
	location?: string | null;
	/** Minutes before startAt; null or undefined = no reminder. */
	reminderOffsetMinutes?: number | null;
};

export type AppointmentScheduleEntry = {
	appointmentId: string;
	title: string;
	body: string;
	/** ISO 8601 UTC instant at which the notification fires. */
	triggerAt: string;
};

function buildTitle(offsetMinutes: number) {
	if (offsetMinutes === 1440) return "Appointment tomorrow";
	if (offsetMinutes % 10080 === 0) {
		const weeks = offsetMinutes / 10080;
		return `Appointment in ${weeks} week${weeks > 1 ? "s" : ""}`;
	}
	if (offsetMinutes % 1440 === 0) {
		const days = offsetMinutes / 1440;
		return `Appointment in ${days} day${days > 1 ? "s" : ""}`;
	}
	if (offsetMinutes % 60 === 0) {
		const hours = offsetMinutes / 60;
		return `Appointment in ${hours} hour${hours > 1 ? "s" : ""}`;
	}
	return `Appointment in ${offsetMinutes} minutes`;
}

function buildBody(appointment: ScheduleAppointment) {
	const parts = [
		appointment.practitionerName,
		appointment.reason,
		appointment.location,
	]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));
	return parts.length ? parts.join(" · ") : "Appointment";
}

/**
 * One notification per appointment that still has a reminder ahead of `now`.
 * Entries whose trigger already passed are dropped rather than scheduled.
 */
export function buildAppointmentSchedule(
	appointments: ScheduleAppointment[],
	now: Date,
): AppointmentScheduleEntry[] {
	const entries: AppointmentScheduleEntry[] = [];
	for (const appointment of appointments) {
		const offset = appointment.reminderOffsetMinutes;
		if (offset === null || offset === undefined) continue;
		const start = appointment.startAt.getTime();
		if (Number.isNaN(start)) continue;
		const trigger = new Date(start - offset * 60_000);
		if (trigger.getTime() <= now.getTime()) continue;
		entries.push({
			appointmentId: appointment.id,
			title: buildTitle(offset),
			body: buildBody(appointment),
			triggerAt: trigger.toISOString(),
		});
	}
	return entries.sort((a, b) => a.triggerAt.localeCompare(b.triggerAt));
}
