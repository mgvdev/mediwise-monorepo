import { expo } from "@better-auth/expo";
import {
	mongoose,
	TenantDomain,
	TenantMember,
	User,
} from "@mediwise-monorepo/db";
import {
	buildOtpEmail,
	extractEmailDomain,
	isEnrollmentActive,
	isTenantDomainActive,
	normalizeEmail,
	resolveDisplayName,
} from "@mediwise-monorepo/domain";
import { adminDomains, corsOrigins, env } from "@mediwise-monorepo/env/server";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";

type TenantEnrollmentDoc = {
	email: string;
	tenantId: string;
	status?: "active" | "disabled";
	name?: string | null;
};

type UserDoc = {
	email: string;
	tenantId?: string | null;
};

type TenantDomainDoc = {
	domain: string;
	tenantId: string;
	status?: "active" | "disabled";
};

type AuthFlow = "member" | "backoffice" | "admin";

const BACKOFFICE_HEADER = "x-mediwise-app";
const BACKOFFICE_APP = "backoffice";
const ADMIN_APP = "admin";

async function getEnrollmentByEmail(email: string) {
	const normalizedEmail = normalizeEmail(email);
	const enrollment = await TenantMember.findOne({
		email: normalizedEmail,
	}).lean<TenantEnrollmentDoc | null>();
	if (!enrollment) return null;
	return {
		...enrollment,
		status: enrollment.status ?? "active",
	};
}

async function getTenantDomainByEmail(email: string) {
	const domain = extractEmailDomain(email);
	if (!domain) return null;
	const tenantDomain = await TenantDomain.findOne({
		domain,
	}).lean<TenantDomainDoc | null>();
	if (!tenantDomain) return null;
	return {
		...tenantDomain,
		status: tenantDomain.status ?? "active",
	};
}

function resolveAuthFlow(ctx?: { request?: Request | undefined }): AuthFlow {
	const appHeader = ctx?.request?.headers.get(BACKOFFICE_HEADER);
	if (appHeader === ADMIN_APP) return "admin";
	return appHeader === BACKOFFICE_APP ? "backoffice" : "member";
}

function isAdminDomain(email: string) {
	const domain = extractEmailDomain(email);
	if (!domain) return false;
	return adminDomains.includes(domain);
}

async function ensureEmailIsPreRegistered(email: string) {
	const normalizedEmail = normalizeEmail(email);
	const existingUser = await User.findOne({
		email: normalizedEmail,
	}).lean<UserDoc | null>();
	if (existingUser) return { enrollment: null, user: existingUser };

	const enrollment = await getEnrollmentByEmail(normalizedEmail);
	if (isEnrollmentActive(enrollment)) {
		return { enrollment, user: null };
	}

	// Demo fallback: auto-enroll unknown emails into a default tenant.
	if (env.NODE_ENV !== "production") {
		const demoEnrollment = {
			email: normalizedEmail,
			tenantId: "demo-tenant",
			status: "active" as const,
			name: null,
		};
		await TenantMember.create(demoEnrollment);
		return { enrollment: demoEnrollment, user: null };
	}

	throw new APIError("BAD_REQUEST", {
		message: "This email is not registered with an insurer.",
	});
}

async function ensureBackofficeDomainAccess(email: string) {
	const normalizedEmail = normalizeEmail(email);
	const domainEntry = await getTenantDomainByEmail(normalizedEmail);
	if (isTenantDomainActive(domainEntry)) return domainEntry;

	const domain = extractEmailDomain(normalizedEmail);
	if (env.NODE_ENV !== "production" && domain) {
		const created = await TenantDomain.findOneAndUpdate(
			{ domain },
			{
				$setOnInsert: {
					domain,
					tenantId: "demo-tenant",
					status: "active",
				},
			},
			{ upsert: true, new: true },
		).lean<TenantDomainDoc | null>();

		if (created) {
			return {
				...created,
				status: created.status ?? "active",
			};
		}
	}

	throw new APIError("BAD_REQUEST", {
		message: "Use your corporate email address to access the backoffice.",
	});
}

async function ensureAdminDomainAccess(email: string) {
	if (isAdminDomain(email)) return;

	if (env.NODE_ENV !== "production" && adminDomains.length === 0) {
		return;
	}

	throw new APIError("BAD_REQUEST", {
		message: "Use your Mediwise corporate email to access the admin console.",
	});
}

async function resolveTenantForUser(email: string) {
	const normalizedEmail = normalizeEmail(email);
	if (isAdminDomain(normalizedEmail)) return null;
	const enrollment = await getEnrollmentByEmail(normalizedEmail);
	if (isEnrollmentActive(enrollment)) {
		return {
			tenantId: enrollment.tenantId,
			name: enrollment.name ?? null,
		};
	}

	const domainEntry = await getTenantDomainByEmail(normalizedEmail);
	if (isTenantDomainActive(domainEntry)) {
		return {
			tenantId: domainEntry.tenantId,
			name: null,
		};
	}

	return null;
}

async function sendOtpEmail({
	email,
	otp,
	type,
}: {
	email: string;
	otp: string;
	type: "sign-in" | "email-verification" | "forget-password";
}) {
	const content = buildOtpEmail({
		email,
		otp,
		type,
		appName: "Mediwise",
	});

	// TODO: Replace with a real email provider (e.g. SES, Resend) in production.
	console.info("[Mediwise OTP]", {
		email,
		subject: content.subject,
		text: content.text,
	});
}

export const auth = betterAuth({
	database: mongodbAdapter(mongoose.connection.getClient().db()),
	trustedOrigins: [...corsOrigins, "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: false,
	},
	disabledPaths: ["/sign-up/email", "/sign-in/email"],
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		emailOTP({
			otpLength: 6,
			expiresIn: 60 * 10,
			async sendVerificationOTP({ email, otp, type }, ctx) {
				if (type === "sign-in") {
					const flow = resolveAuthFlow(ctx);
					if (flow === "backoffice") {
						await ensureBackofficeDomainAccess(email);
					} else if (flow === "admin") {
						await ensureAdminDomainAccess(email);
					} else {
						await ensureEmailIsPreRegistered(email);
					}
				}
				await sendOtpEmail({ email, otp, type });
			},
		}),
		expo(),
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const tenantInfo = await resolveTenantForUser(user.email);
					const displayName = resolveDisplayName({
						primaryName: user.name,
						fallbackName: tenantInfo?.name ?? null,
						fallbackEmail: user.email,
					});

					return {
						data: {
							...user,
							name: displayName,
							tenantId: tenantInfo?.tenantId ?? null,
						},
					};
				},
			},
		},
	},
});
