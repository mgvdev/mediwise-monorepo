import { Tenant, User } from "@mediwise-monorepo/db";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import type { userSearchInput, userTenantUpdateInput } from "../dto";

type UserSearchInput = z.infer<typeof userSearchInput>;
type UserTenantUpdateInput = z.infer<typeof userTenantUpdateInput>;

/**
 * Search users with tenant context for admin management.
 */
export async function searchUsers(input?: UserSearchInput) {
	const query = input?.query?.trim();
	const limit = input?.limit ?? 50;
	const filter = query ? { email: { $regex: query, $options: "i" } } : {};

	const users = await User.find(filter)
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean<
			{
				_id: string;
				email: string;
				tenantId?: string | null;
				createdAt: Date;
			}[]
		>();

	const tenantIds = Array.from(
		new Set(users.map((user) => user.tenantId).filter(Boolean) as string[]),
	);
	const tenants = tenantIds.length
		? await Tenant.find({ _id: { $in: tenantIds } }).lean<
				{
					_id: string;
					name: string;
				}[]
			>()
		: [];
	const tenantMap = new Map(tenants.map((tenant) => [tenant._id, tenant.name]));

	return {
		count: users.length,
		users: users.map((user) => ({
			id: user._id,
			email: user.email,
			tenantId: user.tenantId ?? null,
			tenantName: user.tenantId ? (tenantMap.get(user.tenantId) ?? null) : null,
			createdAt: user.createdAt,
		})),
	};
}

/**
 * Set or unset tenant for a user.
 */
export async function updateUserTenant(input: UserTenantUpdateInput) {
	const update = input.tenantId
		? { $set: { tenantId: input.tenantId } }
		: { $unset: { tenantId: "" } };
	const updated = await User.findByIdAndUpdate(input.userId, update, {
		new: true,
	}).lean<{ _id: string; tenantId?: string | null } | null>();

	if (!updated) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "User not found.",
		});
	}

	return {
		id: updated._id,
		tenantId: updated.tenantId ?? null,
	};
}
