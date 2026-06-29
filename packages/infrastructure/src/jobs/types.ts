export const JobTypes = {
	prescriptionExtract: "prescription.extract",
	interactionAnalysis: "interaction.analysis",
} as const;

export type JobType = (typeof JobTypes)[keyof typeof JobTypes];

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type JobPayloadByType = {
	[JobTypes.prescriptionExtract]: {
		rawId: string;
		provider: string | null;
		model: string | null;
	};
	[JobTypes.interactionAnalysis]: {
		userId: string;
		provider: string | null;
		model: string | null;
	};
};

export type JobDoc<TType extends JobType = JobType> = {
	_id: string;
	type: TType;
	status: JobStatus;
	attempts: number;
	payload: JobPayloadByType[TType];
	lockedAt?: Date | null;
	lockedBy?: string | null;
	startedAt?: Date | null;
	finishedAt?: Date | null;
	error?: string | null;
	createdAt: Date;
	updatedAt: Date;
};
