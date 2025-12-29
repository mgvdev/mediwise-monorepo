export type PrescriptionStatus =
	| "queued"
	| "processing"
	| "completed"
	| "failed";

export type PrescriptionSource = "upload" | "camera";

export type PrescriptionRawDoc = {
	_id: string;
	userId: string;
	tenantId: string | null;
	source: PrescriptionSource;
	storageKey: string;
	originalFilename: string;
	contentType: string;
	size: number;
	status: PrescriptionStatus;
	error?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type PrescriptionJobDoc = {
	_id: string;
	rawId: string;
	status: PrescriptionStatus;
	attempts: number;
	lockedAt?: Date | null;
	lockedBy?: string | null;
	startedAt?: Date | null;
	finishedAt?: Date | null;
	provider?: string | null;
	model?: string | null;
	error?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type UnifiedMedication = {
	name: string;
	dosage?: string | null;
	frequency?: string | null;
	route?: string | null;
	duration?: string | null;
	quantity?: string | null;
	refills?: string | null;
	instructions?: string | null;
};

export type UnifiedPrescriptionData = {
	patientName?: string | null;
	prescriberName?: string | null;
	issuedDate?: string | null;
	medications: UnifiedMedication[];
	notes?: string | null;
};

export type PrescriptionUnifiedDoc = {
	_id: string;
	rawId: string;
	userId: string;
	tenantId: string | null;
	provider: string;
	model: string;
	data: UnifiedPrescriptionData;
	createdAt: Date;
};

export type PrescriptionSummary = {
	rawId: string;
	status: PrescriptionStatus;
	createdAt: Date;
	filename: string;
	medicationSummary?: string | null;
};
