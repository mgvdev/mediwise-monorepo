import { z } from "zod";

export const appointmentSaveInput = z.object({
	id: z.string().optional().nullable(),
	practitionerId: z.string().optional().nullable(),
	// ISO 8601 instant, e.g. "2026-08-12T09:30:00.000Z".
	startAt: z.string().min(1),
	reason: z.string().optional().nullable(),
	location: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
	reminderOffsetMinutes: z.number().int().positive().optional().nullable(),
});

export const appointmentListInput = z.object({
	practitionerId: z.string().optional().nullable(),
});

export const appointmentIdInput = z.object({
	id: z.string().min(1),
});

export type AppointmentSaveInput = z.infer<typeof appointmentSaveInput>;
