import mongoose from "mongoose";

const { Schema, model } = mongoose;

// One reminder configuration per medication (per user). Medications have no
// stable id yet, so we key by normalized name + dosage (mirrors the way the
// treatment detail screen resolves a medication from the unified view).
const reminderSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		medicationName: { type: String, required: true },
		medicationDosage: { type: String, default: null },
		// Master toggle for this medication's reminders.
		enabled: { type: Boolean, required: true, default: true },
		// Subset of intake moments that fire (morning/noon/evening/bedtime/with_meal).
		moments: { type: [String], required: true, default: [] },
		// Per-moment "HH:mm" override of the user's global time map.
		timeOverrides: { type: Schema.Types.Mixed, default: {} },
		// Optional day-of-week filter (0=Sunday..6=Saturday). Empty = every day.
		daysOfWeek: { type: [Number], default: [] },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "reminder" },
);

reminderSchema.index(
	{ userId: 1, medicationName: 1, medicationDosage: 1 },
	{ unique: true },
);

// Per-user reminder settings: the global intake-moment -> "HH:mm" time map.
const reminderSettingsSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true, unique: true },
		tenantId: { type: String },
		timeMap: { type: Schema.Types.Mixed, required: true, default: {} },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "reminder_settings" },
);

const Reminder = model("Reminder", reminderSchema);
const ReminderSettings = model("ReminderSettings", reminderSettingsSchema);

export { Reminder, ReminderSettings };
