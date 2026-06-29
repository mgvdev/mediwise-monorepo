import type { JobDoc, JobTypes } from "@mediwise-monorepo/infrastructure/jobs";
import type {
	AiProvider,
	StorageProvider,
} from "@mediwise-monorepo/infrastructure/prescriptions";
import {
	createUnified,
	findRawById,
	updateRawStatus,
} from "@mediwise-monorepo/infrastructure/prescriptions";

import type { JobHandler } from "./types";
import { JobHandlerError } from "./types";

type PrescriptionJob = JobDoc<typeof JobTypes.prescriptionExtract>;

type HandlerDeps = {
	storage: StorageProvider;
	aiProvider: AiProvider;
};

export function createPrescriptionHandler({
	storage,
	aiProvider,
}: HandlerDeps): JobHandler {
	return {
		handle: async (job) => {
			const typedJob = job as PrescriptionJob;
			const raw = await findRawById(typedJob.payload.rawId);
			if (!raw) {
				throw new JobHandlerError("Raw prescription not found.", false);
			}

			await updateRawStatus({ rawId: raw._id, status: "processing" });
			const storageKeys = raw.storageKeys?.length
				? raw.storageKeys
				: [raw.storageKey];
			const images = await Promise.all(
				storageKeys.map((key) => storage.getFileBuffer(key)),
			);
			const data = await aiProvider.extractPrescription({
				images,
				mimeType: raw.contentType,
			});

			// documentType ("prescription" | "report" | "unknown") rides along in
			// `data`. Reports are persisted here but filtered out of the unified
			// prescription view; full compte-rendu handling is TODO (6.6).
			await createUnified({
				raw,
				provider: aiProvider.provider,
				model: aiProvider.model,
				data,
			});

			await updateRawStatus({ rawId: raw._id, status: "completed" });
		},
		onFailure: async (job, error, shouldRetry) => {
			const typedJob = job as PrescriptionJob;
			await updateRawStatus({
				rawId: typedJob.payload.rawId,
				status: shouldRetry ? "queued" : "failed",
				error: error.message,
			});
		},
	};
}
