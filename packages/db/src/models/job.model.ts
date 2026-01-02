import mongoose from "mongoose";

const { Schema, model } = mongoose;

const jobSchema = new Schema(
	{
		_id: { type: String },
		type: { type: String, required: true },
		status: { type: String, required: true },
		attempts: { type: Number, required: true },
		payload: { type: Schema.Types.Mixed, required: true },
		lockedAt: { type: Date },
		lockedBy: { type: String },
		startedAt: { type: Date },
		finishedAt: { type: Date },
		error: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "job" },
);

const Job = model("Job", jobSchema);

export { Job };
