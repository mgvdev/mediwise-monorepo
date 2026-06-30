import { upsertExamFromScan } from "@mediwise-monorepo/infrastructure/exams";
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

			// Persist the unified doc for every document (reports are kept but
			// filtered out of the prescription view). A medical report also
			// becomes an Exam (6.6) so it shows in the exams list with the scan.
			await createUnified({
				raw,
				provider: aiProvider.provider,
				model: aiProvider.model,
				data,
			});

			if (data.documentType === "report") {
				await upsertExamFromScan({
					userId: raw.userId,
					tenantId: raw.tenantId,
					rawId: raw._id,
					source: raw.source,
					fields: {
						title:
							data.report?.title?.trim() ||
							raw.originalFilename ||
							"Compte rendu",
						examDate: data.report?.examDate ?? data.issuedDate ?? null,
						conclusion: data.report?.conclusion ?? null,
						doctor: data.report?.doctor ?? data.prescriberName ?? null,
					},
				});
			}

			await updateRawStatus({
				rawId: raw._id,
				status: "completed",
				documentType: data.documentType ?? "unknown",
			});
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
