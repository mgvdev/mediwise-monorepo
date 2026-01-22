import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
	{
		_id: { type: String },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		emailVerified: { type: Boolean, required: true },
		tenantId: { type: String },
		image: { type: String },
		healthData: {
			personal: { type: Schema.Types.Mixed },
			encrypted: { type: String },
			onboarding: {
				currentCategoryKey: { type: String },
				startedAt: { type: Date },
				completedAt: { type: Date },
			},
			updatedAt: { type: Date },
		},
		onboardedAt: { type: Date },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "user" },
);

const sessionSchema = new Schema(
	{
		_id: { type: String },
		expiresAt: { type: Date, required: true },
		token: { type: String, required: true, unique: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
		ipAddress: { type: String },
		userAgent: { type: String },
		userId: { type: String, ref: "User", required: true },
	},
	{ collection: "session" },
);

const accountSchema = new Schema(
	{
		_id: { type: String },
		accountId: { type: String, required: true },
		providerId: { type: String, required: true },
		userId: { type: String, ref: "User", required: true },
		accessToken: { type: String },
		refreshToken: { type: String },
		idToken: { type: String },
		accessTokenExpiresAt: { type: Date },
		refreshTokenExpiresAt: { type: Date },
		scope: { type: String },
		password: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "account" },
);

const verificationSchema = new Schema(
	{
		_id: { type: String },
		identifier: { type: String, required: true },
		value: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{ collection: "verification" },
);

const tenantMemberSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		tenantId: { type: String, required: true },
		status: { type: String },
		name: { type: String },
	},
	{ collection: "tenant_members" },
);

const tenantDomainSchema = new Schema(
	{
		domain: { type: String, required: true, unique: true },
		tenantId: { type: String, required: true },
		status: { type: String },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{ collection: "tenant_domains" },
);

const User = model("User", userSchema);
const Session = model("Session", sessionSchema);
const Account = model("Account", accountSchema);
const Verification = model("Verification", verificationSchema);
const TenantMember = model("TenantMember", tenantMemberSchema);
const TenantDomain = model("TenantDomain", tenantDomainSchema);

export { User, Session, Account, Verification, TenantMember, TenantDomain };
