import { randomUUID } from "node:crypto";

import { Appointment } from "@mediwise-monorepo/db";

import type { AppointmentDoc, AppointmentFields } from "./types";

export async function listAppointmentsByUser(input: {
	userId: string;
	practitionerId?: string | null;
}) {
	const filter: Record<string, unknown> = { userId: input.userId };
	if (input.practitionerId) filter.practitionerId = input.practitionerId;
	return Appointment.find(filter).sort({ startAt: 1 }).lean<AppointmentDoc[]>();
}

export async function getAppointmentById(input: {
	id: string;
	userId: string;
}) {
	return Appointment.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<AppointmentDoc | null>();
}

export async function createAppointment(input: {
	userId: string;
	tenantId: string | null;
	fields: AppointmentFields;
}) {
	const now = new Date();
	const doc: AppointmentDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		practitionerId: input.fields.practitionerId ?? null,
		practitionerName: input.fields.practitionerName ?? null,
		startAt: input.fields.startAt,
		reason: input.fields.reason ?? null,
		location: input.fields.location ?? null,
		notes: input.fields.notes ?? null,
		reminderOffsetMinutes: input.fields.reminderOffsetMinutes ?? null,
		createdAt: now,
		updatedAt: now,
	};
	await Appointment.create(doc);
	return doc;
}

export async function updateAppointment(input: {
	id: string;
	userId: string;
	fields: AppointmentFields;
}) {
	return Appointment.findOneAndUpdate(
		{ _id: input.id, userId: input.userId },
		{
			$set: {
				practitionerId: input.fields.practitionerId ?? null,
				practitionerName: input.fields.practitionerName ?? null,
				startAt: input.fields.startAt,
				reason: input.fields.reason ?? null,
				location: input.fields.location ?? null,
				notes: input.fields.notes ?? null,
				reminderOffsetMinutes: input.fields.reminderOffsetMinutes ?? null,
				updatedAt: new Date(),
			},
		},
		{ new: true },
	).lean<AppointmentDoc | null>();
}

export async function deleteAppointment(input: { id: string; userId: string }) {
	const res = await Appointment.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	return res.deletedCount > 0;
}

/**
 * Unlink a deleted practitioner from their appointments. The denormalized
 * `practitionerName` is kept so the appointment still reads correctly.
 */
export async function detachPractitionerFromAppointments(input: {
	practitionerId: string;
	userId: string;
}) {
	const res = await Appointment.updateMany(
		{ practitionerId: input.practitionerId, userId: input.userId },
		{ $set: { practitionerId: null, updatedAt: new Date() } },
	);
	return res.modifiedCount;
}
