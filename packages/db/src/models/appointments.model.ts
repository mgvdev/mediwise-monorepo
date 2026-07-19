import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		// Null when no practitioner is linked, or after that practitioner was
		// deleted (the name snapshot below is kept).
		practitionerId: { type: String },
		practitionerName: { type: String },
		startAt: { type: Date, required: true },
		reason: { type: String },
		location: { type: String },
		notes: { type: String },
		// Minutes before startAt for the reminder; null = no reminder.
		reminderOffsetMinutes: { type: Number },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "appointment" },
);

const Appointment = model("Appointment", appointmentSchema);

export { Appointment };
