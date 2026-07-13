export type OtpPurpose =
	| "sign-in"
	| "email-verification"
	| "forget-password"
	| "change-email";

export type OtpEmailPayload = {
	email: string;
	otp: string;
	type: OtpPurpose;
	appName: string;
};

export type OtpEmailContent = {
	subject: string;
	text: string;
};

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function buildOtpEmail({
	email,
	otp,
	type,
	appName,
}: OtpEmailPayload): OtpEmailContent {
	const typeLabel =
		type === "sign-in"
			? "sign-in"
			: type === "email-verification"
				? "verification"
				: type === "change-email"
					? "email-change"
					: "reset";
	const subject = `[${appName}] Your ${typeLabel} code`;
	const text = [
		`Your ${appName} ${typeLabel} code is: ${otp}`,
		"",
		"This code expires in a few minutes.",
		"",
		"If you did not request this code, you can ignore this email.",
		`Requested for: ${email}`,
	].join("\n");

	return { subject, text };
}
