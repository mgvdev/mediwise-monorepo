import { z } from "zod";

import type { UnifiedPrescriptionData } from "./types";

const medicationSchema = z.object({
	name: z.string().min(1),
	dosage: z.string().nullable().optional(),
	frequency: z.string().nullable().optional(),
	frequencyCount: z.number().nullable().optional(),
	frequencyUnit: z.enum(["day", "week", "month"]).nullable().optional(),
	route: z.string().nullable().optional(),
	duration: z.string().nullable().optional(),
	durationValue: z.number().nullable().optional(),
	durationUnit: z.enum(["day", "week", "month"]).nullable().optional(),
	refills: z.string().nullable().optional(),
	instructions: z.string().nullable().optional(),
	form: z.string().nullable().optional(),
	intakeMoments: z.array(z.string()).nullable().optional(),
});

const unifiedSchema = z.object({
	documentType: z
		.enum(["prescription", "report", "unknown"])
		.nullable()
		.optional(),
	patientName: z.string().nullable().optional(),
	prescriberName: z.string().nullable().optional(),
	issuedDate: z.string().nullable().optional(),
	validUntil: z.string().nullable().optional(),
	medications: z.array(medicationSchema).default([]),
	notes: z.string().nullable().optional(),
});

// JSON Schema mirror of unifiedSchema, passed to Ollama's `format` for
// structured outputs. Kept in sync with the zod schema above by hand.
// Enums omit `null` (some Ollama builds reject null-in-enum); nullability is
// enforced downstream by zod's `.nullable()`.
export const UNIFIED_JSON_SCHEMA = {
	type: "object",
	properties: {
		documentType: {
			type: "string",
			enum: ["prescription", "report", "unknown"],
		},
		patientName: { type: ["string", "null"] },
		prescriberName: { type: ["string", "null"] },
		issuedDate: { type: ["string", "null"] },
		validUntil: { type: ["string", "null"] },
		notes: { type: ["string", "null"] },
		medications: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					dosage: { type: ["string", "null"] },
					frequency: { type: ["string", "null"] },
					frequencyCount: { type: ["number", "null"] },
					frequencyUnit: { type: ["string", "null"] },
					route: { type: ["string", "null"] },
					duration: { type: ["string", "null"] },
					durationValue: { type: ["number", "null"] },
					durationUnit: { type: ["string", "null"] },
					refills: { type: ["string", "null"] },
					instructions: { type: ["string", "null"] },
					form: { type: ["string", "null"] },
				},
				required: ["name"],
			},
		},
	},
	required: ["documentType", "medications"],
} as const;

function extractJson(text: string) {
	const first = text.indexOf("{");
	const last = text.lastIndexOf("}");
	if (first === -1 || last === -1 || last <= first) {
		throw new Error("No JSON found in AI response.");
	}
	const jsonText = text.slice(first, last + 1);
	return JSON.parse(jsonText);
}

export function normalizeAiResponse(text: string): UnifiedPrescriptionData {
	const parsed = extractJson(text.trim());
	return unifiedSchema.parse(parsed);
}
