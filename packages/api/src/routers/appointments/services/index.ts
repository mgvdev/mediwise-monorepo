import { buildAppointmentSchedule } from "@mediwise-monorepo/domain";
import {
	createAppointment,
	deleteAppointment as deleteAppointmentRepo,
	getAppointmentById,
	listAppointmentsByUser,
	updateAppointment,
} from "@mediwise-monorepo/infrastructure/appointments";
import type {
	AppointmentDoc,
	AppointmentFields,
} from "@mediwise-monorepo/infrastructure/appointments";
import { getPractitionerById } from "@mediwise-monorepo/infrastructure/practitioners";
import { TRPCError } from "@trpc/server";

import type { AppointmentSaveInput } from "../dto";

// iOS caps an app at 64 pending local notifications; the pre-existing
// medication reminders already claim a share of that budget, so keep the
// appointment schedule to its soonest entries only.
const MAX_SCHEDULE_ENTRIES = 20;

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

function resolveTenantId(user: SessionUser) {
	return user.tenantId ?? null;
}

function toDto(appointment: AppointmentDoc) {
	return {
		id: appointment._id,
		practitionerId: appointment.practitionerId ?? null,
		practitionerName: appointment.practitionerName ?? null,
		startAt: appointment.startAt,
		reason: appointment.reason ?? null,
		location: appointment.location ?? null,
		notes: appointment.notes ?? null,
		reminderOffsetMinutes: appointment.reminderOffsetMinutes ?? null,
	};
}

export async function listAppointments(params: {
	userId: string;
	practitionerId?: string | null;
}) {
	const appointments = await listAppointmentsByUser({
		userId: params.userId,
		practitionerId: params.practitionerId,
	});
	return appointments.map(toDto);
}

export async function getAppointment(params: { userId: string; id: string }) {
	const appointment = await getAppointmentById({
		id: params.id,
		userId: params.userId,
	});
	if (!appointment) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Appointment not found.",
		});
	}
	return toDto(appointment);
}

export async function saveAppointment(params: {
	user: SessionUser;
	input: AppointmentSaveInput;
}) {
	const startAt = new Date(params.input.startAt);
	if (Number.isNaN(startAt.getTime())) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid appointment date.",
		});
	}

	// Snapshot the practitioner name so the appointment still reads correctly
	// after that practitioner is deleted.
	let practitionerName: string | null = null;
	if (params.input.practitionerId) {
		const practitioner = await getPractitionerById({
			id: params.input.practitionerId,
			userId: params.user.id,
		});
		if (!practitioner) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Practitioner not found.",
			});
		}
		practitionerName = [practitioner.firstName, practitioner.lastName]
			.filter(Boolean)
			.join(" ");
	} else if (params.input.id) {
		// No practitioner given on an update: keep the existing snapshot instead
		// of wiping it, since the practitioner may have been deleted already
		// (see detachPractitionerFromAppointments) while the name should live on.
		const existing = await getAppointmentById({
			id: params.input.id,
			userId: params.user.id,
		});
		if (!existing) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Appointment not found.",
			});
		}
		practitionerName = existing.practitionerName ?? null;
	}

	const fields: AppointmentFields = {
		practitionerId: params.input.practitionerId ?? null,
		practitionerName,
		startAt,
		reason: params.input.reason?.trim() || null,
		location: params.input.location?.trim() || null,
		notes: params.input.notes?.trim() || null,
		reminderOffsetMinutes: params.input.reminderOffsetMinutes ?? null,
	};

	if (params.input.id) {
		const updated = await updateAppointment({
			id: params.input.id,
			userId: params.user.id,
			fields,
		});
		if (!updated) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Appointment not found.",
			});
		}
		return { id: updated._id };
	}

	const created = await createAppointment({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		fields,
	});
	return { id: created._id };
}

export async function deleteAppointment(params: {
	userId: string;
	id: string;
}) {
	const deleted = await deleteAppointmentRepo({
		id: params.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Appointment not found.",
		});
	}
	return { id: params.id, deleted: true };
}

/** Flat notification schedule the native client schedules verbatim. */
export async function getAppointmentSchedule(params: { userId: string }) {
	const appointments = await listAppointmentsByUser({ userId: params.userId });
	const schedule = buildAppointmentSchedule(
		appointments.map((appointment) => ({
			id: appointment._id,
			startAt: appointment.startAt,
			practitionerName: appointment.practitionerName ?? null,
			reason: appointment.reason ?? null,
			location: appointment.location ?? null,
			reminderOffsetMinutes: appointment.reminderOffsetMinutes ?? null,
		})),
		new Date(),
	);
	return schedule.slice(0, MAX_SCHEDULE_ENTRIES);
}
