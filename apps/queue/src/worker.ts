import type {
	AiProvider,
	StorageProvider,
} from "@mediwise-monorepo/infrastructure/prescriptions";
import {
	createUnified,
	findRawById,
	lockNextJob,
	markJobCompleted,
	markJobFailed,
	updateRawStatus,
} from "@mediwise-monorepo/infrastructure/prescriptions";

type WorkerConfig = {
	workerId: string;
	lockTimeoutMs: number;
	maxAttempts: number;
	storage: StorageProvider;
	aiProvider: AiProvider;
};

export function createQueueWorker({
	workerId,
	lockTimeoutMs,
	maxAttempts,
	storage,
	aiProvider,
}: WorkerConfig) {
	let isDraining = false;

	async function processNextJob() {
		const job = await lockNextJob({ workerId, lockTimeoutMs });
		if (!job) {
			return false;
		}

		const raw = await findRawById(job.rawId);
		if (!raw) {
			await markJobFailed({
				jobId: job._id,
				error: "Raw prescription not found.",
				shouldRetry: false,
			});
			return true;
		}

		try {
			await updateRawStatus({ rawId: raw._id, status: "processing" });
			const buffer = await storage.getFileBuffer(raw.storageKey);
			const data = await aiProvider.extractPrescription({
				image: buffer,
				mimeType: raw.contentType,
			});

			await createUnified({
				raw,
				provider: aiProvider.provider,
				model: aiProvider.model,
				data,
			});

			await updateRawStatus({ rawId: raw._id, status: "completed" });
			await markJobCompleted(job._id);
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			const shouldRetry = job.attempts < maxAttempts;
			await updateRawStatus({
				rawId: raw._id,
				status: shouldRetry ? "queued" : "failed",
				error: message,
			});
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
