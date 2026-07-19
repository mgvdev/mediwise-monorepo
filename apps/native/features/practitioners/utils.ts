import { SPECIALTIES, specialtyLabel } from "./specialties";

export type PractitionerListItem = {
	id: string;
	firstName: string | null;
	lastName: string;
	specialty: string;
	specialtyOther: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
	source: string;
};

export function formatPractitionerName(item: {
	firstName: string | null;
	lastName: string;
}) {
	return [item.firstName, item.lastName].filter(Boolean).join(" ");
}

/**
 * Group practitioners into specialty sections, in the order of the specialty
 * list ("Other" last). Free-text specialties get one section per label.
 */
export function groupBySpecialty(items: PractitionerListItem[]) {
	const groups: {
		key: string;
		label: string;
		items: PractitionerListItem[];
	}[] = [];
	const index = new Map<string, number>();

	for (const item of items) {
		const label = specialtyLabel(item.specialty, item.specialtyOther);
		const key = item.specialty === "other" ? `other:${label}` : item.specialty;
		if (!index.has(key)) {
			index.set(key, groups.length);
			groups.push({ key, label, items: [] });
		}
		const position = index.get(key);
		if (position !== undefined) groups[position]?.items.push(item);
	}

	const order = new Map(
		SPECIALTIES.map((specialty, position) => [specialty.key, position]),
	);
	return groups.sort((a, b) => {
		const rankA = order.get(a.key) ?? Number.MAX_SAFE_INTEGER;
		const rankB = order.get(b.key) ?? Number.MAX_SAFE_INTEGER;
		return rankA - rankB || a.label.localeCompare(b.label);
	});
}
