import { ALLERGY_RULES, DRUG_DRUG_RULES } from "./ruleset";
import type { InteractionItem } from "./types";

// Normalize free-text drug/allergy names for keyword matching: lowercase, strip
// accents, collapse non-alphanumerics to single spaces.
export function normalizeName(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function hasKeyword(normalized: string, keyword: string): boolean {
	const k = normalizeName(keyword);
	if (!k) return false;
	// Word-boundary-ish: match the keyword as a standalone token sequence.
	return (
		normalized === k ||
		normalized.startsWith(`${k} `) ||
		normalized.endsWith(` ${k}`) ||
		normalized.includes(` ${k} `) ||
		normalized.includes(k)
	);
}

function matchesAny(normalized: string, keywords: string[]): boolean {
	return keywords.some((keyword) => hasKeyword(normalized, keyword));
}

/**
 * Deterministic, explainable matching of the curated ruleset against the active
 * medication names and the patient's allergy list. Returns `source: "curated"`
 * items only.
 */
export function matchCuratedInteractions(input: {
	medications: string[];
	allergies: string[];
}): InteractionItem[] {
	const meds = input.medications
		.map((name) => ({ raw: name, norm: normalizeName(name) }))
		.filter((m) => m.norm.length > 0);
	const allergies = input.allergies
		.map((name) => ({ raw: name, norm: normalizeName(name) }))
		.filter((a) => a.norm.length > 0);

	const items: InteractionItem[] = [];
	const seen = new Set<string>();

	const push = (item: InteractionItem) => {
		const key = `${item.type}|${[item.a, item.b].sort().join("|")}`;
		if (seen.has(key)) return;
		seen.add(key);
		items.push(item);
	};

	// Drug ↔ drug: check every unordered pair of medications against each rule.
	for (let i = 0; i < meds.length; i += 1) {
		for (let j = i + 1; j < meds.length; j += 1) {
			const m1 = meds[i];
			const m2 = meds[j];
			if (!m1 || !m2) continue;
			for (const rule of DRUG_DRUG_RULES) {
				const direct =
					matchesAny(m1.norm, rule.a) && matchesAny(m2.norm, rule.b);
				const swapped =
					matchesAny(m2.norm, rule.a) && matchesAny(m1.norm, rule.b);
				if (direct || swapped) {
					push({
						type: "drug_drug",
						severity: rule.severity,
						a: m1.raw,
						b: m2.raw,
						description: `${rule.description} (${rule.source})`,
						source: "curated",
					});
				}
			}
		}
	}

	// Drug ↔ allergy: each medication against each allergy class rule.
	for (const allergy of allergies) {
		for (const rule of ALLERGY_RULES) {
			if (!matchesAny(allergy.norm, rule.allergen)) continue;
			for (const med of meds) {
				if (matchesAny(med.norm, rule.drugKeywords)) {
					push({
						type: "drug_allergy",
						severity: rule.severity,
						a: med.raw,
						b: allergy.raw,
						description: `${rule.description} (${rule.source})`,
						source: "curated",
					});
				}
			}
		}
	}

	return items;
}
