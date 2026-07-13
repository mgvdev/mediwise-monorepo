import { getCurrentTreatments } from "@mediwise-monorepo/domain";
import { env } from "@mediwise-monorepo/env/server";
import { getInteractionsView } from "@mediwise-monorepo/infrastructure/interactions";
import {
	createJob,
	createRawPrescription,
	createStorageProvider,
	deleteUnifiedPrescription,
	findRawById,
	findUnifiedById,
	findUnifiedByRawId,
	getUnifiedViewByUser,
	listPrescriptionsByUser,
	recomputeUnifiedView,
	updateUnifiedViewProfile,
	upsertUnifiedPrescription,
} from "@mediwise-monorepo/infrastructure/prescriptions";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import type {
	prescriptionGetInput,
	prescriptionInput,
	prescriptionUnifiedProfileInput,
	prescriptionUploadInput,
} from "../dto";

/**
 * Extract tenant id from the session user (when available).
 * Some auth flows do not attach tenant data on the user object.
 */
function resolveTenantId(user: unknown) {
	return "tenantId" in Object(user)
		? ((user as { tenantId?: string | null }).tenantId ?? null)
		: null;
}

type PrescriptionInput = z.infer<typeof prescriptionInput>;
type PrescriptionGetInput = z.infer<typeof prescriptionGetInput>;
type PrescriptionUploadInput = z.infer<typeof prescriptionUploadInput>;
type PrescriptionUnifiedProfileInput = z.infer<
	typeof prescriptionUnifiedProfileInput
>;

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

/**
 * List recent prescriptions for the current user.
 */
export async function listPrescriptions(params: {
	userId: string;
	limit?: number;
}) {
	return listPrescriptionsByUser({
		userId: params.userId,
		limit: params.limit,
	});
}

/**
 * Resolve raw + unified prescription by rawId or id.
 */
export async function getPrescription(params: {
	userId: string;
	input: PrescriptionGetInput;
}) {
	const { userId, input } = params;
	const rawId = input.rawId;
	const id = input.id;

	const raw = rawId ? await findRawById(rawId) : null;
	if (raw && raw.userId !== userId) {
		return null;
	}

	let unified = null;
	if (rawId) {
		unified = await findUnifiedByRawId({ rawId, userId });
	}
	if (!unified && id) {
		unified = await findUnifiedById({ id, userId });
	}

	if (!raw && !unified) return null;

	return {
		raw: raw
			? {
					id: raw._id,
					status: raw.status,
					createdAt: raw.createdAt,
					filename: raw.originalFilename,
					source: raw.source,
				}
			: null,
		unified: unified
			? {
					id: unified._id,
					rawId: unified.rawId ?? null,
					source: unified.source ?? "manual",
					data: unified.data,
					createdAt: unified.createdAt,
					updatedAt: unified.updatedAt ?? null,
				}
			: null,
	};
}

/**
 * Upsert a unified prescription (manual or derived from raw).
 */
export async function savePrescription(params: {
	user: SessionUser;
	input: PrescriptionInput;
}) {
	const { user, input } = params;
	const userId = user.id;
	const raw = input.rawId ? await findRawById(input.rawId) : null;
	if (raw && raw.userId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Invalid prescription reference.",
		});
	}

	const existing =
		input.id && !input.rawId
			? await findUnifiedById({ id: input.id, userId })
			: input.rawId
				? await findUnifiedByRawId({ rawId: input.rawId, userId })
				: null;

	if (input.id && !existing) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Prescription not found.",
		});
	}

	const source = raw?.source ?? existing?.source ?? "manual";
	const provider = existing?.provider ?? "manual";
	const model = existing?.model ?? "manual";
	const tenantId = raw?.tenantId ?? existing?.tenantId ?? resolveTenantId(user);

	const doc = await upsertUnifiedPrescription({
		id: input.id ?? undefined,
		rawId: input.rawId ?? existing?.rawId ?? null,
		userId,
		tenantId,
		source,
		provider,
		model,
		data: {
			prescriberName: input.prescriberName ?? null,
			issuedDate: input.issuedDate ?? null,
			validUntil: input.validUntil ?? null,
			medications: input.medications.map((medication) => ({
				name: medication.name,
				dosage: medication.dosage ?? null,
				frequency: medication.frequency ?? null,
				frequencyCount: medication.frequencyCount ?? null,
				frequencyUnit: medication.frequencyUnit ?? null,
				durationType: medication.durationType ?? null,
				duration: medication.duration ?? null,
				durationValue: medication.durationValue ?? null,
				durationUnit: medication.durationUnit ?? null,
				route: medication.route ?? null,
				instructions: medication.instructions ?? null,
				form: medication.form ?? null,
				intakeMoments: medication.intakeMoments ?? null,
			})),
			notes: input.notes ?? null,
		},
	});

	return {
		id: doc._id,
		rawId: doc.rawId ?? null,
		updatedAt: doc.updatedAt ?? null,
	};
}

/**
 * Delete a unified prescription owned by the user.
 */
export async function deletePrescription(params: {
	userId: string;
	input: { id: string };
}) {
	const deleted = await deleteUnifiedPrescription({
		id: params.input.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Prescription not found.",
		});
	}
	return { id: params.input.id, deleted: true };
}

/**
 * Store file, create raw record, and enqueue AI job if needed.
 */
export async function uploadPrescription(params: {
	user: SessionUser;
	input: PrescriptionUploadInput;
}) {
	const { user, input } = params;

	if (!input.contentType.startsWith("image/")) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Only image uploads are supported for now.",
		});
	}

	const base64 = input.base64.includes(",")
		? (input.base64.split(",").pop() ?? "")
		: input.base64;

	let fileBuffer: Buffer;
	try {
		fileBuffer = Buffer.from(base64, "base64");
	} catch (error) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid file payload.",
			cause: error,
		});
	}

	const file = new File([fileBuffer], input.filename, {
		type: input.contentType,
	});

	const storage = createStorageProvider();
	const stored = await storage.saveFile(file, { prefix: user.id });
	const isManual = input.intent === "manual";
	const tenantId = resolveTenantId(user);

	// Save any extra pages of a multi-page document; page 1 stays in storageKey.
	const storageKeys = [stored.key];
	for (const page of input.additionalPages ?? []) {
		const pageBase64 = page.base64.includes(",")
			? (page.base64.split(",").pop() ?? "")
			: page.base64;
		const pageFile = new File(
			[Buffer.from(pageBase64, "base64")],
			page.filename,
			{
				type: page.contentType,
			},
		);
		const pageStored = await storage.saveFile(pageFile, { prefix: user.id });
		storageKeys.push(pageStored.key);
	}

	const raw = await createRawPrescription({
		userId: user.id,
		tenantId,
		source: input.source,
		storageKey: stored.key,
		storageKeys,
		originalFilename: input.filename,
		contentType: input.contentType,
		size: file.size,
		status: isManual ? "completed" : undefined,
	});

	if (!isManual) {
		await createJob({
			rawId: raw._id,
			provider: env.AI_PROVIDER,
			model: env.AI_PROVIDER === "openai" ? env.OPENAI_MODEL : env.OLLAMA_MODEL,
		});
	}

	return { id: raw._id, status: raw.status };
}

/**
 * Fetch the persisted unified view for the current user.
 */
export async function getUnifiedView(params: { userId: string }) {
	const existing = await getUnifiedViewByUser(params.userId);
	if (existing) return existing;
	return recomputeUnifiedView(params.userId);
}

export async function getCurrentTreatmentsView(params: { userId: string }) {
	return getCurrentTreatments({
		userId: params.userId,
		fetchUnifiedView: getUnifiedViewByUser,
	});
}

/**
 * Fetch the persisted drug-interaction analysis for the current user.
 * Returns empty items when no analysis has run yet.
 */
export async function getInteractions(params: { userId: string }) {
	const view = await getInteractionsView(params.userId);
	return {
		items: view?.items ?? [],
		disclaimer: view?.disclaimer ?? null,
		updatedAt: view?.updatedAt ?? null,
	};
}

/**
 * Update editable medical profile fields in the unified view.
 */
export async function updateUnifiedProfile(params: {
	userId: string;
	input: PrescriptionUnifiedProfileInput;
}) {
	const updated = await updateUnifiedViewProfile({
		userId: params.userId,
		profile: params.input,
	});
	if (!updated) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Unified prescription view not found.",
		});
	}
	return updated;
}
