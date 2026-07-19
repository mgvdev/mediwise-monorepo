import { env } from "@mediwise-monorepo/env/server";
import mongoose from "mongoose";

import { Appointment } from "./models/appointments.model";
import {
	Account,
	Session,
	TenantDomain,
	TenantMember,
	User,
	Verification,
} from "./models/auth.model";
import { Exam } from "./models/exams.model";
import { Job } from "./models/job.model";
import { Practitioner } from "./models/practitioners.model";
import {
	PrescriptionInteractionsView,
	PrescriptionRaw,
	PrescriptionUnified,
	PrescriptionUnifiedView,
} from "./models/prescriptions.model";
import { Questionnaire } from "./models/questionnaire.model";
import { Reminder, ReminderSettings } from "./models/reminders.model";
import { Tenant } from "./models/tenant.model";

await mongoose.connect(env.DATABASE_URL).catch((error) => {
	console.log("Error connecting to database:", error);
});

export {
	Account,
	Appointment,
	Exam,
	Job,
	mongoose,
	Practitioner,
	PrescriptionInteractionsView,
	PrescriptionRaw,
	PrescriptionUnified,
	PrescriptionUnifiedView,
	Questionnaire,
	Reminder,
	ReminderSettings,
	Session,
	Tenant,
	TenantDomain,
	TenantMember,
	User,
	Verification,
};
