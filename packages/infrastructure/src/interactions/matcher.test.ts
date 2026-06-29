import { describe, expect, it } from "bun:test";
import { matchCuratedInteractions, normalizeName } from "./matcher";

describe("normalizeName", () => {
	it("lowercases and strips accents/punctuation", () => {
		expect(normalizeName("Ibuprofène 400mg")).toBe("ibuprofene 400mg");
		expect(normalizeName("Pénicilline-V")).toBe("penicilline v");
	});
});

describe("matchCuratedInteractions", () => {
	it("flags a known drug-drug pair as danger", () => {
		const items = matchCuratedInteractions({
			medications: ["Warfarine 5mg", "Ibuprofène 400mg"],
			allergies: [],
		});
		const ddi = items.filter((i) => i.type === "drug_drug");
		expect(ddi).toHaveLength(1);
		expect(ddi[0]?.severity).toBe("danger");
		expect(ddi[0]?.source).toBe("curated");
	});

	it("flags an allergy↔drug conflict (penicillin class)", () => {
		const items = matchCuratedInteractions({
			medications: ["Amoxicilline 500mg"],
			allergies: ["Pénicilline"],
		});
		const conflict = items.find((i) => i.type === "drug_allergy");
		expect(conflict).toBeDefined();
		expect(conflict?.severity).toBe("danger");
		expect(conflict?.b).toBe("Pénicilline");
	});

	it("returns nothing for a single safe medication", () => {
		const items = matchCuratedInteractions({
			medications: ["Paracétamol 1g"],
			allergies: [],
		});
		expect(items).toHaveLength(0);
	});

	it("does not duplicate a pair regardless of order", () => {
		const items = matchCuratedInteractions({
			medications: ["Ibuprofène", "Warfarine"],
			allergies: [],
		});
		expect(items.filter((i) => i.type === "drug_drug")).toHaveLength(1);
	});
});
