import { randomUUID } from "node:crypto";

import { Reminder, ReminderSettings } from "@mediwise-monorepo/db";

import type {
	ReminderDoc,
	ReminderSettingsDoc,
	UpsertReminderInput,
} from "./types";

// Normalize a dosage the same way the unified view does, so reminder keys line
// up with the medication keys used across the prescriptions feature.
function normalizeDosage(dosage?: string | null) {
	const trimmed = dosage?.trim();
	return trimmed ? trimmed : null;
}

export async function listReminders(userId: string) {
	return Reminder.find({ userId }).sort({ createdAt: 1 }).lean<ReminderDoc[]>();
}

export async function upsertReminder(input: UpsertReminderInput) {
	const now = new Date();
	const dosage = normalizeDosage(input.medicationDosage);

	const updated = await Reminder.findOneAndUpdate(
		{
			userId: input.userId,
			medicationName: input.medicationName,
			medicationDosage: dosage,
		},
		{
			$set: {
				tenantId: input.tenantId ?? null,
				enabled: input.enabled,
				moments: input.moments,
				timeOverrides: input.timeOverrides ?? {},
				daysOfWeek: input.daysOfWeek ?? [],
				updatedAt: now,
			},
			$setOnInsert: {
				_id: randomUUID(),
				userId: input.userId,
				medicationName: input.medicationName,
				medicationDosage: dosage,
				createdAt: now,
			},
		},
		{ upsert: true, new: true },
	).lean<ReminderDoc | null>();

	return updated;
}

export async function deleteReminder(input: {
	userId: string;
	medicationName: string;
	medicationDosage?: string | null;
}) {
	const result = await Reminder.deleteOne({
		userId: input.userId,
		medicationName: input.medicationName,
		medicationDosage: normalizeDosage(input.medicationDosage),
	});
	return result.deletedCount > 0;
}

export async function getReminderSettings(userId: string) {
	return ReminderSettings.findOne({
		userId,
	}).lean<ReminderSettingsDoc | null>();
}

export async function updateReminderSettings(input: {
	userId: string;
	tenantId?: string | null;
	timeMap: Record<string, string>;
}) {
	const now = new Date();
	return ReminderSettings.findOneAndUpdate(
		{ userId: input.userId },
		{
			$set: {
				timeMap: input.timeMap,
				tenantId: input.tenantId ?? null,
				updatedAt: now,
			},
			$setOnInsert: {
				_id: randomUUID(),
				userId: input.userId,
			},
		},
		{ upsert: true, new: true },
	).lean<ReminderSettingsDoc | null>();
}
