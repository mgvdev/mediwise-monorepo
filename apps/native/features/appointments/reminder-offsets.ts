/**
 * Reminder presets offered on the appointment form. Minutes are what the server
 * stores (`reminderOffsetMinutes`); null means no reminder.
 */
export const REMINDER_OFFSET_OPTIONS = [
	{ value: "none", label: "No reminder" },
	{ value: "1h", label: "1 hour before" },
	{ value: "1d", label: "1 day before" },
	{ value: "1w", label: "1 week before" },
];

export const OFFSET_MINUTES: Record<string, number | null> = {
	none: null,
	"1h": 60,
	"1d": 1440,
	"1w": 10080,
};

export const DEFAULT_OFFSET_KEY = "1d";

/** Map a stored offset back to a preset key, falling back to "1 day before". */
export function offsetKeyFromMinutes(minutes: number | null | undefined) {
	if (minutes === null || minutes === undefined) return "none";
	const match = Object.entries(OFFSET_MINUTES).find(
		([, value]) => value === minutes,
	);
	return match?.[0] ?? DEFAULT_OFFSET_KEY;
}
