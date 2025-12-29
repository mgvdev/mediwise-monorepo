import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionnaireSchema = new Schema(
	{
		_id: { type: String },
		key: { type: String, required: true },
		title: { type: String, required: true },
		definition: { type: Schema.Types.Mixed, required: true },
		tenantId: { type: String },
		updatedBy: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "questionnaires" },
);

const Questionnaire = model("Questionnaire", questionnaireSchema);

export { Questionnaire };
