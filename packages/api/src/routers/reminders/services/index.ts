import { getReminders } from "@mediwise-monorepo/domain";
import type {
	ReminderConfig,
	ReminderTimeMap,
} from "@mediwise-monorepo/domain";
import { getUnifiedViewByUser } from "@mediwise-monorepo/infrastructure/prescriptions";
import {
	deleteReminder,
	getReminderSettings,
	listReminders,
	updateReminderSettings,
	upsertReminder,
} from "@mediwise-monorepo/infrastructure/reminders";
import type { z } from "zod";

import type {
	reminderDeleteInput,
	reminderSettingsInput,
	reminderUpsertInput,
} from "../dto";

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

type ReminderUpsertInput = z.infer<typeof reminderUpsertInput>;
type ReminderDeleteInput = z.infer<typeof reminderDeleteInput>;
type ReminderSettingsInput = z.infer<typeof reminderSettingsInput>;

function resolveTenantId(user: unknown) {
	return "tenantId" in Object(user)
		? ((user as { tenantId?: string | null }).tenantId ?? null)
		: null;
}

async function fetchReminders(userId: string): Promise<ReminderConfig[]> {
	const docs = await listReminders(userId);
	return docs.map((doc) => ({
		medicationName: doc.medicationName,
		medicationDosage: doc.medicationDosage ?? null,
		enabled: doc.enabled,
		moments: doc.moments ?? [],
		timeOverrides: doc.timeOverrides ?? {},
		daysOfWeek: doc.daysOfWeek ?? [],
	}));
}

async function fetchTimeMap(userId: string): Promise<ReminderTimeMap | null> {
	const settings = await getReminderSettings(userId);
	return settings?.timeMap ?? null;
}

async function fetchMedications(userId: string) {
	const view = await getUnifiedViewByUser(userId);
	if (!view) return null;
	return {
		medications: (view.medications ?? []).map((medication) => ({
			name: medication.name,
			dosage: medication.dosage ?? null,
			intakeMoments: medication.intakeMoments ?? null,
			status: medication.status,
		})),
		updatedAt: view.updatedAt ?? null,
	};
}

/**
 * Reminders + computed notification schedule + effective time map.
 */
export async function getRemindersView(params: { userId: string }) {
	return getReminders({
		userId: params.userId,
		fetchReminders,
		fetchTimeMap,
		fetchMedications,
	});
}

/**
 * Create or update a medication's reminder configuration.
 */
export async function upsertReminderConfig(params: {
	user: SessionUser;
	input: ReminderUpsertInput;
}) {
	const { user, input } = params;
	await upsertReminder({
		userId: user.id,
		tenantId: resolveTenantId(user),
		medicationName: input.medicationName,
		medicationDosage: input.medicationDosage ?? null,
		enabled: input.enabled,
		moments: input.moments,
		timeOverrides: input.timeOverrides ?? {},
		daysOfWeek: input.daysOfWeek ?? [],
	});
	return getRemindersView({ userId: user.id });
}

/**
 * Remove a medication's reminder configuration.
 */
export async function deleteReminderConfig(params: {
	userId: string;
	input: ReminderDeleteInput;
}) {
	await deleteReminder({
		userId: params.userId,
		medicationName: params.input.medicationName,
		medicationDosage: params.input.medicationDosage ?? null,
	});
	return getRemindersView({ userId: params.userId });
}

/**
 * Update the user's global intake-moment -> time map.
 */
export async function updateReminderSettingsConfig(params: {
	user: SessionUser;
	input: ReminderSettingsInput;
}) {
	await updateReminderSettings({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		timeMap: params.input.timeMap,
	});
	return getRemindersView({ userId: params.user.id });
}
