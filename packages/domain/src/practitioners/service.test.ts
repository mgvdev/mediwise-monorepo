import { describe, expect, it } from "bun:test";

import {
	buildPractitionerSuggestions,
	normalizePractitionerName,
} from "./service";

describe("normalizePractitionerName", () => {
	it("strips titles, collapses spaces and lowercases", () => {
		expect(normalizePractitionerName("Dr. Jane  Doe")).toBe("jane doe");
		expect(normalizePractitionerName("  doctor JANE DOE ")).toBe("jane doe");
		expect(normalizePractitionerName("Pr Jane Doe")).toBe("jane doe");
		expect(normalizePractitionerName("Prof. Jane Doe")).toBe("jane doe");
	});

	it("keeps a name that has no title", () => {
		expect(normalizePractitionerName("Jane Doe")).toBe("jane doe");
	});

	it("returns an empty string for blank input", () => {
		expect(normalizePractitionerName("   ")).toBe("");
		expect(normalizePractitionerName("Dr.")).toBe("");
	});
});

describe("buildPractitionerSuggestions", () => {
	it("drops names already in the directory, whatever the title or case", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Jane Doe", occurrences: 2 },
				{ name: "Dr. John Roe", occurrences: 1 },
			],
			existingNames: ["jane doe"],
		});
		expect(suggestions).toEqual([
			{ displayName: "Dr. John Roe", occurrences: 1 },
		]);
	});

	it("merges duplicates and sums their occurrences", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Jane Doe", occurrences: 2 },
				{ name: "jane doe", occurrences: 3 },
			],
			existingNames: [],
		});
		expect(suggestions).toEqual([
			{ displayName: "Dr. Jane Doe", occurrences: 5 },
		]);
	});

	it("sorts by occurrences desc then name asc", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Zoe Ray", occurrences: 1 },
				{ name: "Dr. Amy Poe", occurrences: 1 },
				{ name: "Dr. Jane Doe", occurrences: 4 },
			],
			existingNames: [],
		});
		expect(suggestions.map((item) => item.displayName)).toEqual([
			"Dr. Jane Doe",
			"Dr. Amy Poe",
			"Dr. Zoe Ray",
		]);
	});

	it("ignores blank and single-character names", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "   ", occurrences: 1 },
				{ name: "X", occurrences: 1 },
				{ name: "Dr.", occurrences: 1 },
			],
			existingNames: [],
		});
		expect(suggestions).toEqual([]);
	});
});
