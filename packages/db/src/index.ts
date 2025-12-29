import { env } from "@mediwise-monorepo/env/server";
import mongoose from "mongoose";

import {
	Account,
	Session,
	TenantDomain,
	TenantMember,
	User,
	Verification,
} from "./models/auth.model";
import {
	PrescriptionJob,
	PrescriptionRaw,
	PrescriptionUnified,
} from "./models/prescriptions.model";
import { Questionnaire } from "./models/questionnaire.model";
import { Tenant } from "./models/tenant.model";

await mongoose.connect(env.DATABASE_URL).catch((error) => {
	console.log("Error connecting to database:", error);
});

export {
	Account,
	PrescriptionJob,
	PrescriptionRaw,
	PrescriptionUnified,
	Questionnaire,
	Session,
	TenantDomain,
	Tenant,
	TenantMember,
	User,
	Verification,
	mongoose,
};
