import { Tenant, TenantDomain, User } from "@mediwise-monorepo/db";

/**
 * Aggregate admin dashboard stats.
 */
export async function getAdminStats() {
	const [users, insurers, domains] = await Promise.all([
		User.countDocuments(),
		Tenant.countDocuments(),
		TenantDomain.countDocuments(),
	]);

	return {
		users,
		insurers,
		domains,
	};
}
