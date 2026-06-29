import { randomUUID } from "node:crypto";

import { PrescriptionRaw, PrescriptionUnified } from "@mediwise-monorepo/db";

import { createJob as createQueueJob, JobTypes } from "../jobs";
import type {
	PrescriptionRawDoc,
	PrescriptionStatus,
	PrescriptionSummary,
	PrescriptionUnifiedDoc,
	UnifiedPrescriptionData,
} from "./types";
import { recomputeUnifiedView } from "./unified-view";

export async function createRawPrescription(input: {
	userId: string;
	tenantId: string | null;
	source: "upload" | "camera";
	storageKey: string;
	storageKeys?: string[];
	originalFilename: string;
	contentType: string;
	size: number;
	status?: PrescriptionStatus;
}) {
	const now = new Date();
	const doc: PrescriptionRawDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		source: input.source,
		storageKey: input.storageKey,
		storageKeys: input.storageKeys ?? [input.storageKey],
		originalFilename: input.originalFilename,
		contentType: input.contentType,
		size: input.size,
		status: input.status ?? "queued",
		createdAt: now,
		updatedAt: now,
	};

	await PrescriptionRaw.create(doc);
	return doc;
}

export async function createJob(input: {
	rawId: string;
	provider?: string;
	model?: string;
}) {
	return createQueueJob({
		type: JobTypes.prescriptionExtract,
		payload: {
			rawId: input.rawId,
			provider: input.provider ?? null,
			model: input.model ?? null,
		},
	});
}

export async function listPrescriptionsByUser(input: {
	userId: string;
	limit?: number;
}) {
	const limit = input.limit;
	const rawQuery = PrescriptionRaw.find({ userId: input.userId }).sort({
		createdAt: -1,
	});
	if (typeof limit === "number") {
		rawQuery.limit(limit);
	}
	const raws = await rawQuery.lean<PrescriptionRawDoc[]>();

	const unifiedByRaw = raws.length
		? await PrescriptionUnified.find({
				rawId: { $in: raws.map((raw) => raw._id) },
			}).lean<PrescriptionUnifiedDoc[]>()
		: [];
	const unifiedMap = new Map(unifiedByRaw.map((doc) => [doc.rawId, doc]));

	const rawSummaries: PrescriptionSummary[] = raws.map((raw) => {
		const unified = unifiedMap.get(raw._id);
		const medicationName = unified?.data.medications?.[0]?.name || null;
		return {
			id: raw._id,
			rawId: raw._id,
			source: raw.source,
			status: raw.status,
			createdAt: raw.createdAt,
			filename: raw.originalFilename,
			medicationSummary: medicationName,
		};
	});

	const rawIds = new Set(raws.map((raw) => raw._id));
	const manualQuery = PrescriptionUnified.find({
		userId: input.userId,
		source: "manual",
	}).sort({ createdAt: -1 });
	if (typeof limit === "number") {
		manualQuery.limit(limit);
	}
	const manualUnified = await manualQuery.lean<PrescriptionUnifiedDoc[]>();

	const manualSummaries = manualUnified
		.filter((doc) => !doc.rawId || !rawIds.has(doc.rawId))
		.map((doc) => {
			const medicationName = doc.data.medications?.[0]?.name || null;
			return {
				id: doc._id,
				rawId: doc.rawId ?? null,
				source: doc.source ?? "manual",
				status: "completed" as PrescriptionStatus,
				createdAt: doc.createdAt,
				filename: "Manual prescription",
				medicationSummary: medicationName,
			};
		});

	const combined = [...rawSummaries, ...manualSummaries].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);

	return typeof limit === "number" ? combined.slice(0, limit) : combined;
}

export async function findRawById(rawId: string) {
	return PrescriptionRaw.findById(rawId).lean<PrescriptionRawDoc | null>();
}

export async function updateRawStatus(input: {
	rawId: string;
	status: PrescriptionStatus;
	error?: string | null;
}) {
	await PrescriptionRaw.updateOne(
		{ _id: input.rawId },
		{
			$set: {
				status: input.status,
				error: input.error ?? null,
				updatedAt: new Date(),
			},
		},
	);
}

export async function createUnified(input: {
	raw: PrescriptionRawDoc;
	provider: string;
	model: string;
	data: UnifiedPrescriptionData;
}) {
	const existing = await PrescriptionUnified.findOne({
		rawId: input.raw._id,
	}).lean<PrescriptionUnifiedDoc | null>();

	if (existing?.source === "manual") {
		await recomputeUnifiedView(input.raw.userId);
		return existing;
	}

	await PrescriptionUnified.deleteMany({ rawId: input.raw._id });
	const doc: PrescriptionUnifiedDoc = {
		_id: randomUUID(),
		rawId: input.raw._id,
		userId: input.raw.userId,
		tenantId: input.raw.tenantId,
		provider: input.provider,
		model: input.model,
		source: input.raw.source,
		data: input.data,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	await PrescriptionUnified.create(doc);
	await recomputeUnifiedView(input.raw.userId);
	return doc;
}

export async function findUnifiedByRawId(input: {
	rawId: string;
	userId: string;
}) {
	return PrescriptionUnified.findOne({
		rawId: input.rawId,
		userId: input.userId,
	}).lean<PrescriptionUnifiedDoc | null>();
}

export async function findUnifiedById(input: { id: string; userId: string }) {
	return PrescriptionUnified.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<PrescriptionUnifiedDoc | null>();
}

/**
 * Delete a unified prescription (and its source raw, if any), then recompute
 * the unified view. Returns false when nothing matched the user.
 */
export async function deleteUnifiedPrescription(input: {
	id: string;
	userId: string;
}) {
	const existing = await PrescriptionUnified.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<PrescriptionUnifiedDoc | null>();

	if (!existing) return false;

	await PrescriptionUnified.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	if (existing.rawId) {
		await PrescriptionRaw.deleteOne({
			_id: existing.rawId,
			userId: input.userId,
		});
	}

	await recomputeUnifiedView(input.userId);
	return true;
}

export async function upsertUnifiedPrescription(input: {
	id?: string;
	rawId?: string | null;
	userId: string;
	tenantId: string | null;
	source: "upload" | "camera" | "manual";
	provider: string;
	model: string;
	data: UnifiedPrescriptionData;
}) {
	const now = new Date();

	if (input.id) {
		const updated = await PrescriptionUnified.findOneAndUpdate(
			{ _id: input.id, userId: input.userId },
			{
				$set: {
					tenantId: input.tenantId,
					source: input.source,
					provider: input.provider,
					model: input.model,
					data: input.data,
					updatedAt: now,
				},
			},
			{ new: true },
		).lean<PrescriptionUnifiedDoc | null>();

		if (updated) {
			await recomputeUnifiedView(input.userId);
			return updated;
		}
	}

	if (input.rawId) {
		const updated = await PrescriptionUnified.findOneAndUpdate(
			{ rawId: input.rawId, userId: input.userId },
			{
				$set: {
					tenantId: input.tenantId,
					source: input.source,
					provider: input.provider,
					model: input.model,
					data: input.data,
					updatedAt: now,
				},
				$setOnInsert: {
					_id: randomUUID(),
					rawId: input.rawId,
					userId: input.userId,
					createdAt: now,
				},
			},
			{ upsert: true, new: true },
		).lean<PrescriptionUnifiedDoc | null>();

		if (updated) {
			await recomputeUnifiedView(input.userId);
			return updated;
		}
	}

	const doc: PrescriptionUnifiedDoc = {
		_id: randomUUID(),
		rawId: input.rawId ?? null,
		userId: input.userId,
		tenantId: input.tenantId,
		provider: input.provider,
		model: input.model,
		source: input.source,
		data: input.data,
		createdAt: now,
		updatedAt: now,
	};

	await PrescriptionUnified.create(doc);
	await recomputeUnifiedView(input.userId);
	return doc;
}
