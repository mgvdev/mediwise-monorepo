// Pure reminder logic: seeding a reminder from a medication, resolving clock
// times from the user's global time map, and computing the flat schedule the
// native client hands straight to expo-notifications. No IO here — the tRPC
// service layer injects the fetchers (see api/routers/reminders/services).

export type ReminderTimeMap = Record<string, string>;

// Known intake moments (mirrors INTAKE_MOMENTS on the native side).
export const REMINDER_MOMENTS = [
	"morning",
	"noon",
	"evening",
	"bedtime",
	"with_meal",
] as const;

export type ReminderMoment = (typeof REMINDER_MOMENTS)[number];

// Fallback times, applied when the user has no override and no global-map entry.
export const DEFAULT_TIME_MAP: ReminderTimeMap = {
	morning: "08:00",
	noon: "12:30",
	evening: "19:00",
	bedtime: "22:00",
	with_meal: "12:30",
};

export type ReminderMedication = {
	name: string;
	dosage?: string | null;
	intakeMoments?: string[] | null;
	status: "active" | "ended";
};

export type ReminderConfig = {
	medicationName: string;
	medicationDosage?: string | null;
	enabled: boolean;
	moments: string[];
	timeOverrides?: Record<string, string> | null;
	daysOfWeek?: number[] | null;
};

export type ScheduleEntry = {
	medicationName: string;
	medicationDosage: string | null;
	moment: string;
	// "HH:mm" 24h local time.
	time: string;
	// Empty = every day. Otherwise 0=Sunday..6=Saturday.
	daysOfWeek: number[];
};

export type ReminderWithStatus = ReminderConfig & {
	// Whether the referenced medication is still an active treatment.
	medicationActive: boolean;
};

function normalizeName(value: string) {
	return value.trim().toLowerCase();
}

function normalizeDosage(dosage?: string | null) {
	return dosage ? dosage.trim().toLowerCase() : "";
}

export function buildMedicationKey(medication: {
	name: string;
	dosage?: string | null;
}) {
	return `${normalizeName(medication.name)}::${normalizeDosage(medication.dosage)}`;
}

/**
 * Resolve the clock time for a moment: per-moment override wins, then the
 * user's global time map, then the built-in default.
 */
export function resolveMomentTime(
	moment: string,
	timeMap: ReminderTimeMap,
	overrides?: Record<string, string> | null,
): string {
	return (
		overrides?.[moment] ??
		timeMap[moment] ??
		DEFAULT_TIME_MAP[moment] ??
		"09:00"
	);
}

/**
 * Seed a default reminder config from a medication's intake moments. Used both
 * when adding a treatment and when a medication has no reminder yet.
 */
export function buildReminderFromMedication(
	medication: ReminderMedication,
	existing?: ReminderConfig | null,
): ReminderConfig {
	if (existing) return existing;
	const moments = (medication.intakeMoments ?? []).filter((moment) =>
		REMINDER_MOMENTS.includes(moment as ReminderMoment),
	);
	return {
		medicationName: medication.name,
		medicationDosage: medication.dosage ?? null,
		enabled: true,
		moments,
		timeOverrides: {},
		daysOfWeek: [],
	};
}

function compareTime(a: string, b: string) {
	return a.localeCompare(b);
}

/**
 * Flatten enabled reminders (whose medication is still active) into per-moment
 * schedule entries, sorted by time. This is the shape the native notification
 * service schedules directly.
 */
export function computeSchedule(
	reminders: ReminderConfig[],
	activeMedicationKeys: Set<string>,
	timeMap: ReminderTimeMap,
): ScheduleEntry[] {
	const entries: ScheduleEntry[] = [];

	for (const reminder of reminders) {
		if (!reminder.enabled) continue;
		const key = buildMedicationKey({
			name: reminder.medicationName,
			dosage: reminder.medicationDosage,
		});
		if (!activeMedicationKeys.has(key)) continue;

		for (const moment of reminder.moments) {
			entries.push({
				medicationName: reminder.medicationName,
				medicationDosage: reminder.medicationDosage ?? null,
				moment,
				time: resolveMomentTime(moment, timeMap, reminder.timeOverrides),
				daysOfWeek: reminder.daysOfWeek ?? [],
			});
		}
	}

	return entries.sort((a, b) => compareTime(a.time, b.time));
}

export type GetRemindersResult = {
	reminders: ReminderWithStatus[];
	timeMap: ReminderTimeMap;
	schedule: ScheduleEntry[];
	updatedAt: Date | string | null;
};

/**
 * Orchestrate the reminders read: join stored reminders against the active
 * medications from the unified view, resolve the effective time map, and
 * compute the notification schedule. Fetchers are injected for testability.
 */
export async function getReminders(params: {
	userId: string;
	fetchReminders: (userId: string) => Promise<ReminderConfig[]>;
	fetchTimeMap: (userId: string) => Promise<ReminderTimeMap | null>;
	fetchMedications: (
		userId: string,
	) => Promise<{
		medications: ReminderMedication[];
		updatedAt?: Date | string | null;
	} | null>;
}): Promise<GetRemindersResult> {
	const [reminders, storedTimeMap, view] = await Promise.all([
		params.fetchReminders(params.userId),
		params.fetchTimeMap(params.userId),
		params.fetchMedications(params.userId),
	]);

	const medications = view?.medications ?? [];
	const activeKeys = new Set(
		medications
			.filter((medication) => medication.status === "active")
			.map((medication) =>
				buildMedicationKey({
					name: medication.name,
					dosage: medication.dosage,
				}),
			),
	);

	const timeMap: ReminderTimeMap = {
		...DEFAULT_TIME_MAP,
		...(storedTimeMap ?? {}),
	};

	const withStatus: ReminderWithStatus[] = reminders.map((reminder) => ({
		...reminder,
		medicationActive: activeKeys.has(
			buildMedicationKey({
				name: reminder.medicationName,
				dosage: reminder.medicationDosage,
			}),
		),
	}));

	return {
		reminders: withStatus,
		timeMap,
		schedule: computeSchedule(reminders, activeKeys, timeMap),
		updatedAt: view?.updatedAt ?? null,
	};
}
