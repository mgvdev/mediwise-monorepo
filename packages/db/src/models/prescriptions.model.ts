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

const prescriptionUnifiedSchema = new Schema(
	{
		_id: { type: String },
		rawId: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		provider: { type: String, required: true },
		model: { type: String, required: true },
		source: { type: String, required: true },
		data: { type: Schema.Types.Mixed, required: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "prescription_unified" },
);

const PrescriptionRaw = model("PrescriptionRaw", prescriptionRawSchema);
const PrescriptionUnified = model(
	"PrescriptionUnified",
	prescriptionUnifiedSchema,
);

export { PrescriptionRaw, PrescriptionUnified };
