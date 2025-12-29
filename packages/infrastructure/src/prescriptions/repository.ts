import { randomUUID } from "node:crypto";
import {
	PrescriptionJob,
	PrescriptionRaw,
	PrescriptionUnified,
} from "@mediwise-monorepo/db";

import type {
	PrescriptionJobDoc,
	PrescriptionRawDoc,
	PrescriptionStatus,
	PrescriptionSummary,
	PrescriptionUnifiedDoc,
	UnifiedPrescriptionData,
} from "./types";

export async function createRawPrescription(input: {
	userId: string;
	tenantId: string | null;
	source: "upload" | "camera";
	storageKey: string;
	originalFilename: string;
	contentType: string;
	size: number;
}) {
	const now = new Date();
	const doc: PrescriptionRawDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		source: input.source,
		storageKey: input.storageKey,
		originalFilename: input.originalFilename,
		contentType: input.contentType,
		size: input.size,
		status: "queued",
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
	const now = new Date();
	const doc: PrescriptionJobDoc = {
		_id: randomUUID(),
		rawId: input.rawId,
		status: "queued",
		attempts: 0,
		provider: input.provider ?? null,
		model: input.model ?? null,
		createdAt: now,
		updatedAt: now,
	};

	await PrescriptionJob.create(doc);
	return doc;
}

export async function listPrescriptionsByUser(input: {
	userId: string;
	limit?: number;
}) {
	const limit = input.limit ?? 20;
	const raws = await PrescriptionRaw.find({ userId: input.userId })
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean<PrescriptionRawDoc[]>();

	const unifiedByRaw = raws.length
		? await PrescriptionUnified.find({
				rawId: { $in: raws.map((raw) => raw._id) },
			}).lean<PrescriptionUnifiedDoc[]>()
		: [];
	const unifiedMap = new Map(unifiedByRaw.map((doc) => [doc.rawId, doc]));

	const summaries: PrescriptionSummary[] = raws.map((raw) => {
		const unified = unifiedMap.get(raw._id);
		const medicationName = unified?.data.medications?.[0]?.name || null;
		return {
			rawId: raw._id,
			status: raw.status,
			createdAt: raw.createdAt,
			filename: raw.originalFilename,
			medicationSummary: medicationName,
		};
	});

	return summaries;
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
	await PrescriptionUnified.deleteMany({ rawId: input.raw._id });
	const doc: PrescriptionUnifiedDoc = {
		_id: randomUUID(),
		rawId: input.raw._id,
		userId: input.raw.userId,
		tenantId: input.raw.tenantId,
		provider: input.provider,
		model: input.model,
		data: input.data,
		createdAt: new Date(),
	};
	await PrescriptionUnified.create(doc);
	return doc;
}

export async function lockNextJob(input: {
	workerId: string;
	lockTimeoutMs: number;
}) {
	const now = new Date();
	const staleLock = new Date(Date.now() - input.lockTimeoutMs);

	const result = await PrescriptionJob.findOneAndUpdate(
		{
			$or: [
				{ status: "queued" },
				{ status: "processing", lockedAt: { $lte: staleLock } },
			],
		},
		{
			$set: {
				status: "processing",
				lockedAt: now,
				lockedBy: input.workerId,
				startedAt: now,
				updatedAt: now,
			},
			$inc: { attempts: 1 },
		},
		{ sort: { createdAt: 1 }, new: true },
	).lean<PrescriptionJobDoc | null>();

	return result ?? null;
}

export async function markJobCompleted(jobId: string) {
	await PrescriptionJob.updateOne(
		{ _id: jobId },
		{
			$set: {
				status: "completed",
				finishedAt: new Date(),
				updatedAt: new Date(),
			},
		},
	);
}

export async function markJobFailed(input: {
	jobId: string;
	error: string;
	shouldRetry: boolean;
}) {
	await PrescriptionJob.updateOne(
		{ _id: input.jobId },
		{
			$set: {
				status: input.shouldRetry ? "queued" : "failed",
				error: input.error,
				finishedAt: input.shouldRetry ? null : new Date(),
				updatedAt: new Date(),
			},
		},
	);
}

export async function getJobAttempts(jobId: string) {
	const job = await PrescriptionJob.findById(
		jobId,
	).lean<PrescriptionJobDoc | null>();
	return job?.attempts ?? 0;
}
