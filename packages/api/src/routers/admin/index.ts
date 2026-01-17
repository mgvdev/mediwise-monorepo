import { adminProcedure, router } from "../../index";
import {
	domainInput,
	domainRemoveInput,
	tenantInput,
	tenantListInput,
	tenantUpdateInput,
	userSearchInput,
	userTenantUpdateInput,
} from "./dto";
import {
	addTenantDomain,
	createTenant,
	getAdminStats,
	listTenants,
	removeTenantDomain,
	searchUsers,
	updateTenant,
	updateUserTenant,
} from "./services";

export const adminRouter = router({
	stats: adminProcedure.query(async () => {
		return getAdminStats();
	}),
	tenants: router({
		list: adminProcedure.input(tenantListInput).query(async ({ input }) => {
			return listTenants(input);
		}),
		create: adminProcedure.input(tenantInput).mutation(async ({ input }) => {
			return createTenant(input);
		}),
		update: adminProcedure
			.input(tenantUpdateInput)
			.mutation(async ({ input }) => {
				return updateTenant(input);
			}),
		addDomain: adminProcedure.input(domainInput).mutation(async ({ input }) => {
			return addTenantDomain(input);
		}),
		removeDomain: adminProcedure
			.input(domainRemoveInput)
			.mutation(async ({ input }) => {
				return removeTenantDomain(input);
			}),
	}),
	users: router({
		search: adminProcedure.input(userSearchInput).query(async ({ input }) => {
			return searchUsers(input);
		}),
		updateTenant: adminProcedure
			.input(userTenantUpdateInput)
			.mutation(async ({ input }) => {
				return updateUserTenant(input);
			}),
	}),
});
