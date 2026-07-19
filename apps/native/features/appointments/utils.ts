export type AppointmentListItem = {
	id: string;
	practitionerId: string | null;
	practitionerName: string | null;
	startAt: string | Date;
	reason: string | null;
	location: string | null;
	notes: string | null;
	reminderOffsetMinutes: number | null;
};

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function toDate(item: AppointmentListItem) {
	return new Date(item.startAt);
}

/** Upcoming sorted soonest-first, past sorted most-recent-first. */
export function splitUpcomingPast(items: AppointmentListItem[], now: Date) {
	const upcoming: AppointmentListItem[] = [];
	const past: AppointmentListItem[] = [];
	for (const item of items) {
		const date = toDate(item);
		if (Number.isNaN(date.getTime())) continue;
		if (date.getTime() >= now.getTime()) upcoming.push(item);
		else past.push(item);
	}
	upcoming.sort((a, b) => toDate(a).getTime() - toDate(b).getTime());
	past.sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
	return { upcoming, past };
}

/** Month buckets, keeping the order of the input list. */
export function groupByMonth(items: AppointmentListItem[]) {
	const groups: { key: string; label: string; items: AppointmentListItem[] }[] =
		[];
	const index = new Map<string, number>();
	for (const item of items) {
		const date = toDate(item);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		const label = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
		if (!index.has(key)) {
			index.set(key, groups.length);
			groups.push({ key, label, items: [] });
		}
		const position = index.get(key);
		if (position !== undefined) groups[position]?.items.push(item);
	}
	return groups;
}

export function formatAppointmentTime(item: AppointmentListItem) {
	const date = toDate(item);
	if (Number.isNaN(date.getTime())) return "—";
	return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}
