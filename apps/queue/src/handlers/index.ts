import { JobTypes } from "@mediwise-monorepo/infrastructure/jobs";
import type {
	AiProvider,
	StorageProvider,
} from "@mediwise-monorepo/infrastructure/prescriptions";

import { createPrescriptionHandler } from "./prescription";
import type { JobHandlerMap } from "./types";

type HandlerDeps = {
	storage: StorageProvider;
	aiProvider: AiProvider;
};

export function createHandlers(deps: HandlerDeps): JobHandlerMap {
	return {
		[JobTypes.prescriptionExtract]: createPrescriptionHandler(deps),
	};
}
