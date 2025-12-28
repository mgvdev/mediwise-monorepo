export type TenantEnrollmentStatus = "active" | "disabled";

export type TenantEnrollment = {
	email: string;
	tenantId: string;
	status: TenantEnrollmentStatus;
	name?: string | null;
};

export function isEnrollmentActive(
	enrollment: TenantEnrollment | null | undefined,
): enrollment is TenantEnrollment {
	return Boolean(enrollment && enrollment.status === "active");
}

export function resolveDisplayName({
	primaryName,
	fallbackName,
	fallbackEmail,
}: {
	primaryName?: string | null;
	fallbackName?: string | null;
	fallbackEmail: string;
}): string {
	const candidate = primaryName?.trim() || fallbackName?.trim();
	return candidate && candidate.length > 0 ? candidate : fallbackEmail;
}
