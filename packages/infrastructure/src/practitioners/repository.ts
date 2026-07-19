import { randomUUID } from "node:crypto";

import { Exam, Practitioner, PrescriptionUnified } from "@mediwise-monorepo/db";

import { detachPractitionerFromAppointments } from "../appointments/repository";
import type {
	DocumentDoctorName,
	PractitionerDoc,
	PractitionerFields,
	PractitionerSource,
} from "./types";

export async function listPractitionersByUser(input: {
	userId: string;
	search?: string | null;
}) {
	const filter: Record<string, unknown> = { userId: input.userId };
	const search = input.search?.trim();
	if (search) {
		const rx = new RegExp(escapeRegExp(search), "i");
		filter.$or = [
			{ firstName: rx },
			{ lastName: rx },
			{ specialtyOther: rx },
			{ notes: rx },
		];
	}
	return Practitioner.find(filter)
		.sort({ lastName: 1, firstName: 1 })
		.lean<PractitionerDoc[]>();
}

export async function getPractitionerById(input: {
	id: string;
	userId: string;
}) {
	return Practitioner.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<PractitionerDoc | null>();
}

export async function createPractitioner(input: {
	userId: string;
	tenantId: string | null;
	fields: PractitionerFields;
	source: PractitionerSource;
}) {
	const now = new Date();
	const doc: PractitionerDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		firstName: input.fields.firstName ?? null,
		lastName: input.fields.lastName,
		specialty: input.fields.specialty,
		specialtyOther: input.fields.specialtyOther ?? null,
		phone: input.fields.phone ?? null,
		email: input.fields.email ?? null,
		address: input.fields.address ?? null,
		notes: input.fields.notes ?? null,
		source: input.source,
		createdAt: now,
		updatedAt: now,
	};
	await Practitioner.create(doc);
	return doc;
}

export async function updatePractitioner(input: {
	id: string;
	userId: string;
	fields: PractitionerFields;
}) {
	return Practitioner.findOneAndUpdate(
		{ _id: input.id, userId: input.userId },
		{
			$set: {
				firstName: input.fields.firstName ?? null,
				lastName: input.fields.lastName,
				specialty: input.fields.specialty,
				specialtyOther: input.fields.specialtyOther ?? null,
				phone: input.fields.phone ?? null,
				email: input.fields.email ?? null,
				address: input.fields.address ?? null,
				notes: input.fields.notes ?? null,
				updatedAt: new Date(),
			},
		},
		{ new: true },
	).lean<PractitionerDoc | null>();
}

export async function deletePractitioner(input: {
	id: string;
	userId: string;
}) {
	const res = await Practitioner.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	if (res.deletedCount === 0) return false;
	await detachPractitionerFromAppointments({
		practitionerId: input.id,
		userId: input.userId,
	});
	return true;
}

/**
 * Doctor names already extracted from the user's documents: the `doctor` field
 * of exams and the `prescriberName` of unified prescriptions. Raw display
 * names — normalization and dedup happen in the domain layer.
 */
export async function listDoctorNamesFromDocuments(input: { userId: string }) {
	const counts = new Map<string, DocumentDoctorName>();

	const add = (raw: unknown) => {
		if (typeof raw !== "string") return;
		const name = raw.trim();
		if (!name) return;
		const key = name.toLowerCase();
		const existing = counts.get(key);
		if (existing) {
			existing.occurrences += 1;
			return;
		}
		counts.set(key, { name, occurrences: 1 });
	};

	const exams = await Exam.find({ userId: input.userId })
		.select({ doctor: 1 })
		.lean<{ doctor?: string | null }[]>();
	for (const exam of exams) add(exam.doctor);

	const prescriptions = await PrescriptionUnified.find({ userId: input.userId })
		.select({ data: 1 })
		.lean<{ data?: { prescriberName?: string | null } | null }[]>();
	for (const prescription of prescriptions) {
		add(prescription.data?.prescriberName);
	}

	return [...counts.values()];
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
