import { INTAKE_MOMENTS } from "@/components/features/prescription/prescription-types";

import type { ScheduleEntry } from "./notification-service";

// English labels for the reminders feature. The shared INTAKE_MOMENTS labels
// are French (used by the prescriptions UI); reminders stay in English.
const MOMENT_LABELS: Record<string, string> = {
	morning: "Morning",
	noon: "Noon",
	evening: "Evening",
	bedtime: "Bedtime",
	with_meal: "With meal",
};

export function formatMomentLabel(value: string) {
	return MOMENT_LABELS[value] ?? value;
}

export const ALL_MOMENTS = INTAKE_MOMENTS.map((m) => m.value);

// Mirrors DEFAULT_TIME_MAP in packages/domain (kept local so the native bundle
// never imports the domain package, which pulls in the db/mongoose connection).
export const DEFAULT_TIME_MAP: Record<string, string> = {
	morning: "08:00",
	noon: "12:30",
	evening: "19:00",
	bedtime: "22:00",
	with_meal: "12:30",
};

export function resolveMomentTime(
	moment: string,
	timeMap: Record<string, string> | undefined,
	overrides?: Record<string, string> | null,
): string {
	return (
		overrides?.[moment] ??
		timeMap?.[moment] ??
		DEFAULT_TIME_MAP[moment] ??
		"09:00"
	);
}

function timeToMinutes(time: string) {
	const [h, m] = time.split(":");
	return Number.parseInt(h ?? "0", 10) * 60 + Number.parseInt(m ?? "0", 10);
}

/**
 * Schedule entries that fire today (daily, or matching today's weekday),
 * sorted by time.
 */
export function getTodaySchedule(schedule: ScheduleEntry[]): ScheduleEntry[] {
	const weekday = new Date().getDay(); // 0=Sunday..6=Saturday
	return schedule
		.filter(
			(entry) => !entry.daysOfWeek.length || entry.daysOfWeek.includes(weekday),
		)
		.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

/**
 * The next upcoming dose today (>= current time), or the first dose today when
 * none remain later. Returns null when nothing is scheduled today.
 */
export function getNextDose(schedule: ScheduleEntry[]): ScheduleEntry | null {
	const today = getTodaySchedule(schedule);
	if (!today.length) return null;
	const now = new Date();
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	const upcoming = today.find(
		(entry) => timeToMinutes(entry.time) >= nowMinutes,
	);
	return upcoming ?? today[0] ?? null;
}

/**
 * Short caption for the home tile: next dose, count, or a setup hint.
 */
export function reminderTileCaption(
	schedule: ScheduleEntry[] | undefined,
): string {
	if (!schedule || !schedule.length) return "Set up reminders";
	const next = getNextDose(schedule);
	if (next) return `Next: ${next.time} · ${next.medicationName}`;
	return `${schedule.length} scheduled`;
}
