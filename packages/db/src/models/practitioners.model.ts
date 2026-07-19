import mongoose from "mongoose";

const { Schema, model } = mongoose;

const practitionerSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		firstName: { type: String },
		lastName: { type: String, required: true },
		// Key from the native specialty list (e.g. "cardiologist", "other").
		specialty: { type: String, required: true },
		// Free text, only meaningful when specialty === "other".
		specialtyOther: { type: String },
		phone: { type: String },
		email: { type: String },
		address: { type: String },
		notes: { type: String },
		// "manual" | "document" — "document" when created from a suggestion.
		source: { type: String, required: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "practitioner" },
);

const Practitioner = model("Practitioner", practitionerSchema);

export { Practitioner };
