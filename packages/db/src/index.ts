import { env } from "@mediwise-monorepo/env/server";
import mongoose from "mongoose";

import {
	Account,
	Session,
	TenantMember,
	User,
	Verification,
} from "./models/auth.model";
import {
	PrescriptionJob,
	PrescriptionRaw,
	PrescriptionUnified,
} from "./models/prescriptions.model";

await mongoose.connect(env.DATABASE_URL).catch((error) => {
	console.log("Error connecting to database:", error);
});

export {
	Account,
	PrescriptionJob,
	PrescriptionRaw,
	PrescriptionUnified,
	Session,
	TenantMember,
	User,
	Verification,
	mongoose,
};
