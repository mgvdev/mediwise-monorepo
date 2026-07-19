import { buildPractitionerSuggestions } from "@mediwise-monorepo/domain";
import { renamePractitionerOnAppointments } from "@mediwise-monorepo/infrastructure/appointments";
import {
	createPractitioner,
	deletePractitioner as deletePractitionerRepo,
	getPractitionerById,
	listDoctorNamesFromDocuments,
	listPractitionersByUser,
	updatePractitioner,
} from "@mediwise-monorepo/infrastructure/practitioners";
import type {
	PractitionerDoc,
	PractitionerFields,
} from "@mediwise-monorepo/infrastructure/practitioners";
import { TRPCError } from "@trpc/server";

import type { PractitionerSaveInput } from "../dto";

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

function resolveTenantId(user: SessionUser) {
	return user.tenantId ?? null;
}

function toDto(practitioner: PractitionerDoc) {
	return {
		id: practitioner._id,
		firstName: practitioner.firstName ?? null,
		lastName: practitioner.lastName,
		specialty: practitioner.specialty,
		specialtyOther: practitioner.specialtyOther ?? null,
		phone: practitioner.phone ?? null,
		email: practitioner.email ?? null,
		address: practitioner.address ?? null,
		notes: practitioner.notes ?? null,
		source: practitioner.source,
	};
}

export async function listPractitioners(params: {
	userId: string;
	search?: string | null;
}) {
	const practitioners = await listPractitionersByUser({
		userId: params.userId,
		search: params.search,
	});
	return practitioners.map(toDto);
}

export async function getPractitioner(params: { userId: string; id: string }) {
	const practitioner = await getPractitionerById({
		id: params.id,
		userId: params.userId,
	});
	if (!practitioner) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Practitioner not found.",
		});
	}
	return {
		...toDto(practitioner),
		createdAt: practitioner.createdAt,
		updatedAt: practitioner.updatedAt ?? null,
	};
}

export async function savePractitioner(params: {
	user: SessionUser;
	input: PractitionerSaveInput;
}) {
	const fields: PractitionerFields = {
		firstName: params.input.firstName?.trim() || null,
		lastName: params.input.lastName.trim(),
		specialty: params.input.specialty,
		specialtyOther: params.input.specialtyOther?.trim() || null,
		phone: params.input.phone?.trim() || null,
		email: params.input.email?.trim() || null,
		address: params.input.address?.trim() || null,
		notes: params.input.notes?.trim() || null,
	};

	if (params.input.id) {
		const updated = await updatePractitioner({
			id: params.input.id,
			userId: params.user.id,
			fields,
		});
		if (!updated) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Practitioner not found.",
			});
		}
		const name = [fields.firstName, fields.lastName].filter(Boolean).join(" ");
		await renamePractitionerOnAppointments({
			practitionerId: updated._id,
			userId: params.user.id,
			name,
		});
		return { id: updated._id };
	}

	const created = await createPractitioner({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		fields,
		source: params.input.source ?? "manual",
	});
	return { id: created._id };
}

export async function deletePractitioner(params: {
	userId: string;
	id: string;
}) {
	const deleted = await deletePractitionerRepo({
		id: params.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Practitioner not found.",
		});
	}
	return { id: params.id, deleted: true };
}

/**
 * Doctor names found in the user's documents that are not in the directory yet.
 */
export async function listPractitionerSuggestions(params: { userId: string }) {
	const [documentNames, practitioners] = await Promise.all([
		listDoctorNamesFromDocuments({ userId: params.userId }),
		listPractitionersByUser({ userId: params.userId }),
	]);
	return buildPractitionerSuggestions({
		documentNames,
		existingNames: practitioners.map((practitioner) =>
			[practitioner.firstName, practitioner.lastName].filter(Boolean).join(" "),
		),
	});
}
