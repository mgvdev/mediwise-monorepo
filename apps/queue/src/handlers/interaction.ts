import { analyzeAndPersistInteractions } from "@mediwise-monorepo/infrastructure/interactions";
import type { JobDoc, JobTypes } from "@mediwise-monorepo/infrastructure/jobs";

import type { JobHandler } from "./types";

type InteractionJob = JobDoc<typeof JobTypes.interactionAnalysis>;

export function createInteractionHandler(): JobHandler {
	return {
		handle: async (job) => {
			const typedJob = job as InteractionJob;
			await analyzeAndPersistInteractions(typedJob.payload.userId);
		},
		onFailure: async (job, error) => {
			const typedJob = job as InteractionJob;
			console.error(
				`Interaction analysis failed for user ${typedJob.payload.userId}:`,
				error.message,
			);
		},
	};
}
