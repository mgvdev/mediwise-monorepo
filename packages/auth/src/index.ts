import { expo } from "@better-auth/expo";
import { mongoose, TenantMember, User } from "@mediwise-monorepo/db";
import {
	buildOtpEmail,
	isEnrollmentActive,
	normalizeEmail,
	resolveDisplayName,
} from "@mediwise-monorepo/domain";
import { env } from "@mediwise-monorepo/env/server";
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
	trustedOrigins: [env.CORS_ORIGIN, "mybettertapp://", "exp://"],
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
			async sendVerificationOTP({ email, otp, type }) {
				await ensureEmailIsPreRegistered(email);
				await sendOtpEmail({ email, otp, type });
			},
		}),
		expo(),
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const { enrollment } = await ensureEmailIsPreRegistered(user.email);
					const displayName = resolveDisplayName({
						primaryName: user.name,
						fallbackName: enrollment?.name ?? null,
						fallbackEmail: user.email,
					});

					return {
						data: {
							...user,
							name: displayName,
							tenantId: enrollment?.tenantId ?? null,
						},
					};
				},
			},
		},
	},
});
