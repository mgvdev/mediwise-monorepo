import { z } from "zod";

export const examFieldsInput = z.object({
	title: z.string().min(1),
	examDate: z.string().optional().nullable(),
	conclusion: z.string().optional().nullable(),
	doctor: z.string().optional().nullable(),
});

export const examSaveInput = examFieldsInput.extend({
	id: z.string().optional().nullable(),
});

export const examListInput = z.object({
	search: z.string().optional().nullable(),
});

export const examIdInput = z.object({
	id: z.string().min(1),
});

export const examByRawInput = z.object({
	rawId: z.string().min(1),
});
