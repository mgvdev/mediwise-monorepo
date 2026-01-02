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
