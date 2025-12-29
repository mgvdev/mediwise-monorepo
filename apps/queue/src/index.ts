import "dotenv/config";
import { PrescriptionJob } from "@mediwise-monorepo/db";
import { env } from "@mediwise-monorepo/env/server";
import {
	createAiProvider,
	createStorageProvider,
} from "@mediwise-monorepo/infrastructure/prescriptions";

import { startJobChangeStream } from "./change-stream";
import { createPolling } from "./polling";
import { createQueueWorker } from "./worker";

const workerId = `queue-${process.pid}`;
const storage = createStorageProvider();
const aiProvider = createAiProvider();
const worker = createQueueWorker({
	workerId,
	lockTimeoutMs: env.JOB_LOCK_TIMEOUT_MS,
	maxAttempts: env.JOB_MAX_ATTEMPTS,
	storage,
	aiProvider,
});

const startPolling = createPolling({
	intervalMs: env.JOB_POLL_INTERVAL_MS,
	onTick: () => {
		void worker.drainQueue();
	},
});

async function runLoop() {
	console.info(
		`[queue] Worker ${workerId} started. Provider=${aiProvider.provider} Model=${aiProvider.model}`,
	);
	await worker.drainQueue();
	startJobChangeStream({
		collection: PrescriptionJob,
		onQueued: () => {
			void worker.drainQueue();
		},
		onFallback: startPolling,
	});
}

runLoop().catch((error) => {
	console.error("[queue] Fatal error", error);
	process.exit(1);
});
