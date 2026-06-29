import { randomUUID } from "node:crypto";

import { Job } from "@mediwise-monorepo/db";

import type { JobDoc, JobPayloadByType, JobType } from "./types";

export async function createJob<TType extends JobType>(input: {
	type: TType;
	payload: JobPayloadByType[TType];
}) {
	const now = new Date();
	const doc: JobDoc<TType> = {
		_id: randomUUID(),
		type: input.type,
		status: "queued",
		attempts: 0,
		payload: input.payload,
		createdAt: now,
		updatedAt: now,
	};

	await Job.create(doc);
	return doc;
}

/**
 * Drop still-queued jobs of a type for a given user, used to debounce
 * recompute-style jobs so at most one is pending at a time.
 */
export async function dropQueuedJobsForUser(input: {
	type: JobType;
	userId: string;
}) {
	await Job.deleteMany({
		type: input.type,
		status: "queued",
		"payload.userId": input.userId,
	});
}

export async function lockNextJob(input: {
	workerId: string;
	lockTimeoutMs: number;
}) {
	const now = new Date();
	const staleLock = new Date(Date.now() - input.lockTimeoutMs);

	const result = await Job.findOneAndUpdate(
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
	).lean<JobDoc | null>();

	return result ?? null;
}

export async function markJobCompleted(jobId: string) {
	await Job.updateOne(
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
	await Job.updateOne(
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
	const job = await Job.findById(jobId).lean<JobDoc | null>();
	return job?.attempts ?? 0;
}
