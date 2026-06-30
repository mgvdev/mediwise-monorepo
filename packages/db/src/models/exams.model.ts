import mongoose from "mongoose";

const { Schema, model } = mongoose;

const examSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		// Link to the scanned document this exam was extracted from (optional for
		// manually-created exams).
		rawId: { type: String },
		title: { type: String, required: true },
		// ISO date string of when the exam took place (nullable when unknown).
		examDate: { type: String },
		conclusion: { type: String },
		doctor: { type: String },
		source: { type: String, required: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "exam" },
);

const Exam = model("Exam", examSchema);

export { Exam };
