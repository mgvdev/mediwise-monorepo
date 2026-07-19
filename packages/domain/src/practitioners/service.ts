// Pure practitioner-directory logic: turning the doctor names the extraction
// pipeline found in documents into deduplicated suggestions. No IO here — the
// tRPC service layer passes the names in (see api/routers/practitioners).

/** Leading titles stripped before comparing two names. */
const TITLE_PATTERN = /^(dr|doctor|pr|prof|professor)\.?\s+/i;

/**
 * Comparison key for a practitioner name: no title, single spaces, lowercase.
 * Never displayed — only used to dedup.
 */
export function normalizePractitionerName(raw: string): string {
	let value = raw.trim().replace(/\s+/g, " ");
	// A name may carry more than one title ("Pr Dr Jane Doe").
	while (TITLE_PATTERN.test(value)) {
		value = value.replace(TITLE_PATTERN, "").trim();
	}
	// A bare title ("Dr.") leaves nothing behind.
	if (/^(dr|doctor|pr|prof|professor)\.?$/i.test(value)) return "";
	return value.toLowerCase();
}

export type PractitionerSuggestion = {
	/** The raw name as found in the document, shown to the user. */
	displayName: string;
	occurrences: number;
};

/**
 * Names found in documents minus the ones already in the directory, deduped by
 * normalized name and sorted by how often they appear.
 */
export function buildPractitionerSuggestions(input: {
	documentNames: { name: string; occurrences: number }[];
	existingNames: string[];
}): PractitionerSuggestion[] {
	const taken = new Set(
		input.existingNames
			.map((name) => normalizePractitionerName(name))
			.filter((name) => name.length > 0),
	);

	const merged = new Map<string, PractitionerSuggestion>();
	for (const entry of input.documentNames) {
		const key = normalizePractitionerName(entry.name);
		// Single characters are almost always OCR noise.
		if (key.length < 2 || taken.has(key)) continue;
		const existing = merged.get(key);
		if (existing) {
			existing.occurrences += entry.occurrences;
			continue;
		}
		merged.set(key, {
			displayName: entry.name.trim().replace(/\s+/g, " "),
			occurrences: entry.occurrences,
		});
	}

	return [...merged.values()].sort(
		(a, b) =>
			b.occurrences - a.occurrences ||
			a.displayName.localeCompare(b.displayName),
	);
}
