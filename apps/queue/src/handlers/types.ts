import type { JobDoc, JobType } from "@mediwise-monorepo/infrastructure/jobs";

export type JobHandler = {
	handle: (job: JobDoc) => Promise<void>;
	onFailure?: (
		job: JobDoc,
		error: Error,
		shouldRetry: boolean,
	) => Promise<void>;
};

export type JobHandlerMap = Record<JobType, JobHandler>;

export class JobHandlerError extends Error {
	retryable: boolean;

	constructor(message: string, retryable = true) {
		super(message);
		this.retryable = retryable;
	}
}
