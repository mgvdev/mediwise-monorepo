import mongoose from "mongoose";

const { Schema, model } = mongoose;

const prescriptionRawSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		source: { type: String, required: true },
		storageKey: { type: String, required: true },
		originalFilename: { type: String, required: true },
		contentType: { type: String, required: true },
		size: { type: Number, required: true },
		status: { type: String, required: true },
		error: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "prescription_raw" },
);

const prescriptionJobSchema = new Schema(
	{
		_id: { type: String },
		rawId: { type: String, required: true },
		status: { type: String, required: true },
		attempts: { type: Number, required: true },
		lockedAt: { type: Date },
		lockedBy: { type: String },
		startedAt: { type: Date },
		finishedAt: { type: Date },
		provider: { type: String },
		model: { type: String },
		error: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "prescription_job" },
);

const prescriptionUnifiedSchema = new Schema(
	{
		_id: { type: String },
		rawId: { type: String, required: true },
		userId: { type: String, required: true },
		tenantId: { type: String },
		provider: { type: String, required: true },
		model: { type: String, required: true },
		data: { type: Schema.Types.Mixed, required: true },
		createdAt: { type: Date, required: true },
	},
	{ collection: "prescription_unified" },
);

const PrescriptionRaw = model("PrescriptionRaw", prescriptionRawSchema);
const PrescriptionJob = model("PrescriptionJob", prescriptionJobSchema);
const PrescriptionUnified = model(
	"PrescriptionUnified",
	prescriptionUnifiedSchema,
);

export { PrescriptionRaw, PrescriptionJob, PrescriptionUnified };
