import { z } from "zod";

import type { UnifiedPrescriptionData } from "./types";

const medicationSchema = z.object({
	name: z.string().min(1),
	dosage: z.string().nullable().optional(),
	frequency: z.string().nullable().optional(),
	route: z.string().nullable().optional(),
	duration: z.string().nullable().optional(),
	quantity: z.string().nullable().optional(),
	refills: z.string().nullable().optional(),
	instructions: z.string().nullable().optional(),
});

const unifiedSchema = z.object({
	patientName: z.string().nullable().optional(),
	prescriberName: z.string().nullable().optional(),
	issuedDate: z.string().nullable().optional(),
	medications: z.array(medicationSchema).default([]),
	notes: z.string().nullable().optional(),
});

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
