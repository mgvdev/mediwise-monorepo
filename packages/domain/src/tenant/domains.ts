import { normalizeEmail } from "../auth/otp";

export type TenantDomainStatus = "active" | "disabled";

export type TenantDomain = {
	domain: string;
	tenantId: string;
	status: TenantDomainStatus;
};

export function normalizeDomain(domain: string): string {
	return domain.trim().toLowerCase();
}

export function extractEmailDomain(email: string): string | null {
	const normalized = normalizeEmail(email);
	const atIndex = normalized.lastIndexOf("@");
	if (atIndex <= 0 || atIndex === normalized.length - 1) {
		return null;
	}
	return normalizeDomain(normalized.slice(atIndex + 1));
}

export function isTenantDomainActive(
	domain: TenantDomain | null | undefined,
): domain is TenantDomain {
	return Boolean(domain && domain.status === "active");
}
