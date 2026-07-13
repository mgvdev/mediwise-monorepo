import { z } from "zod";

const timeString = z
	.string()
	.regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm");

export const reminderUpsertInput = z.object({
	medicationName: z.string().min(1),
	medicationDosage: z.string().optional().nullable(),
	enabled: z.boolean(),
	moments: z.array(z.string().min(1)),
	timeOverrides: z.record(z.string(), timeString).optional().nullable(),
	daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().nullable(),
});

export const reminderDeleteInput = z.object({
	medicationName: z.string().min(1),
	medicationDosage: z.string().optional().nullable(),
});

export const reminderSettingsInput = z.object({
	timeMap: z.record(z.string(), timeString),
});
