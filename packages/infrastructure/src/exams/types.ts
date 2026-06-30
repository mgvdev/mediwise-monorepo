export type ExamSource = "upload" | "camera" | "manual";

export type ExamDoc = {
	_id: string;
	userId: string;
	tenantId: string | null;
	rawId?: string | null;
	title: string;
	examDate?: string | null;
	conclusion?: string | null;
	doctor?: string | null;
	source: ExamSource;
	createdAt: Date;
	updatedAt?: Date | null;
};

export type ExamFields = {
	title: string;
	examDate?: string | null;
	conclusion?: string | null;
	doctor?: string | null;
};

export type ExamScanImage = {
	base64: string;
	contentType: string;
};
