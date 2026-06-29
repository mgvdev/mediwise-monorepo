import {
	lockNextJob,
	markJobCompleted,
	markJobFailed,
} from "@mediwise-monorepo/infrastructure/jobs";

import type { JobHandlerMap } from "./handlers/types";
import { JobHandlerError } from "./handlers/types";

type WorkerConfig = {
	workerId: string;
	lockTimeoutMs: number;
	maxAttempts: number;
	handlers: JobHandlerMap;
};

export function createQueueWorker({
	workerId,
	lockTimeoutMs,
	maxAttempts,
	handlers,
}: WorkerConfig) {
	let isDraining = false;

	async function processNextJob() {
		const job = await lockNextJob({ workerId, lockTimeoutMs });
		if (!job) {
			return false;
		}

		const handler = handlers[job.type];
		if (!handler) {
			await markJobFailed({
				jobId: job._id,
				error: `No handler registered for job type "${job.type}".`,
				shouldRetry: false,
			});
			return true;
		}

		try {
			await handler.handle(job);
			await markJobCompleted(job._id);
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			const retryable =
				error instanceof JobHandlerError ? error.retryable : true;
			const shouldRetry = retryable && job.attempts < maxAttempts;
			if (handler.onFailure) {
				try {
					const handlerError =
						error instanceof Error ? error : new Error(message);
					await handler.onFailure(job, handlerError, shouldRetry);
				} catch (handlerError) {
					console.error("[queue] Job failure hook error", handlerError);
				}
			}
			await markJobFailed({ jobId: job._id, error: message, shouldRetry });
			return true;
		}
	}

	async function drainQueue() {
		if (isDraining) return;
		isDraining = true;
		try {
			while (await processNextJob()) {
				// Continue draining until no queued jobs remain.
			}
		} finally {
			isDraining = false;
		}
	}

	return { drainQueue };
}
