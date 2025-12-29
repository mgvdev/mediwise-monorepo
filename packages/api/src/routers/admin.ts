import { randomUUID } from "node:crypto";
import { Tenant, TenantDomain, User } from "@mediwise-monorepo/db";
import { extractEmailDomain, normalizeDomain } from "@mediwise-monorepo/domain";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, router } from "../index";

const tenantInput = z.object({
	name: z.string().min(1),
	logoUrl: z.string().url().optional().nullable(),
	domains: z.array(z.string().min(1)).min(1),
});

const domainInput = z.object({
	tenantId: z.string().min(1),
	domain: z.string().min(1),
});

const domainRemoveInput = z.object({
	tenantId: z.string().min(1),
	domainId: z.string().min(1),
});

const tenantUpdateInput = z.object({
	tenantId: z.string().min(1),
	name: z.string().min(1).optional(),
	logoUrl: z.string().url().nullable().optional(),
});

const tenantListInput = z
	.object({
		query: z.string().min(1).optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.optional();

const userSearchInput = z
	.object({
		query: z.string().optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.optional();

const userTenantUpdateInput = z.object({
	userId: z.string().min(1),
	tenantId: z.string().nullable(),
});

export const adminRouter = router({
	stats: adminProcedure.query(async () => {
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
	}),
	tenants: router({
		list: adminProcedure.input(tenantListInput).query(async ({ input }) => {
			const query = input?.query?.trim();
			const filter = query ? { name: { $regex: query, $options: "i" } } : {};
			const limit = input?.limit ?? 100;
			const tenants = await Tenant.find(filter)
				.sort({ createdAt: -1 })
				.limit(limit)
				.lean<
					{
						_id: string;
						name: string;
						logoUrl?: string | null;
						status?: string;
						createdAt: Date;
					}[]
				>();

			const tenantIds = tenants.map((tenant) => tenant._id);
			const domains = tenantIds.length
				? await TenantDomain.find({
						tenantId: { $in: tenantIds },
					}).lean<
						{ _id: string; tenantId: string; domain: string; status?: string }[]
					>()
				: [];

			const domainMap = new Map<
				string,
				{ id: string; domain: string; status: string }[]
			>();

			for (const domain of domains) {
				const existing = domainMap.get(domain.tenantId) ?? [];
				existing.push({
					id: String(domain._id),
					domain: domain.domain,
					status: domain.status ?? "active",
				});
				domainMap.set(domain.tenantId, existing);
			}

			return tenants.map((tenant) => ({
				id: tenant._id,
				name: tenant.name,
				logoUrl: tenant.logoUrl ?? null,
				status: tenant.status ?? "active",
				createdAt: tenant.createdAt,
				domains: domainMap.get(tenant._id) ?? [],
			}));
		}),
		create: adminProcedure.input(tenantInput).mutation(async ({ input }) => {
			const name = input.name.trim();
			const logoUrl = input.logoUrl?.trim() || null;
			const existing = await Tenant.findOne({ name }).lean<{
				_id: string;
			} | null>();
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "An insurer with this name already exists.",
				});
			}

			const normalizedDomains = Array.from(
				new Set(
					(input.domains ?? [])
						.map(
							(domain) => extractEmailDomain(domain) ?? normalizeDomain(domain),
						)
						.filter(Boolean),
				),
			);

			if (normalizedDomains.length) {
				const existingDomain = await TenantDomain.findOne({
					domain: { $in: normalizedDomains },
				}).lean<{ domain: string } | null>();
				if (existingDomain) {
					throw new TRPCError({
						code: "CONFLICT",
						message: `Domain already assigned: ${existingDomain.domain}.`,
					});
				}
			}

			const now = new Date();
			const tenant = await Tenant.create({
				_id: randomUUID(),
				name,
				logoUrl,
				status: "active",
				createdAt: now,
				updatedAt: now,
			});

			const domainDocs = normalizedDomains.map((domain) => ({
				domain,
				tenantId: tenant._id,
				status: "active",
				createdAt: now,
				updatedAt: now,
			}));

			const createdDomains = domainDocs.length
				? await TenantDomain.insertMany(domainDocs)
				: [];

			return {
				id: tenant._id,
				name: tenant.name,
				logoUrl: tenant.logoUrl ?? null,
				domains: createdDomains.map((domain) => ({
					id: String(domain._id),
					domain: domain.domain,
					status: domain.status ?? "active",
				})),
			};
		}),
		update: adminProcedure
			.input(tenantUpdateInput)
			.mutation(async ({ input }) => {
				const update: Record<string, string | Date | null> = {
					updatedAt: new Date(),
				};

				if (input.name) {
					const trimmed = input.name.trim();
					if (!trimmed) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Insurer name is required.",
						});
					}
					const existing = await Tenant.findOne({
						name: trimmed,
						_id: { $ne: input.tenantId },
					}).lean<{ _id: string } | null>();
					if (existing) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "An insurer with this name already exists.",
						});
					}
					update.name = trimmed;
				}

				if (input.logoUrl !== undefined) {
					update.logoUrl = input.logoUrl?.trim() || null;
				}

				const updated = await Tenant.findByIdAndUpdate(
					input.tenantId,
					{ $set: update },
					{ new: true },
				).lean<{ _id: string; name: string; logoUrl?: string | null } | null>();

				if (!updated) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Insurer not found.",
					});
				}

				return {
					id: updated._id,
					name: updated.name,
					logoUrl: updated.logoUrl ?? null,
				};
			}),
		addDomain: adminProcedure.input(domainInput).mutation(async ({ input }) => {
			const tenant = await Tenant.findById(input.tenantId).lean<{
				_id: string;
			} | null>();
			if (!tenant) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Insurer not found.",
				});
			}

			const normalized =
				extractEmailDomain(input.domain) ?? normalizeDomain(input.domain);
			if (!normalized) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Domain is required.",
				});
			}

			const existing = await TenantDomain.findOne({ domain: normalized }).lean<{
				_id: string;
			} | null>();
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This domain is already assigned.",
				});
			}

			const now = new Date();
			const domain = await TenantDomain.create({
				domain: normalized,
				tenantId: input.tenantId,
				status: "active",
				createdAt: now,
				updatedAt: now,
			});

			return {
				id: String(domain._id),
				domain: domain.domain,
				status: domain.status ?? "active",
			};
		}),
		removeDomain: adminProcedure
			.input(domainRemoveInput)
			.mutation(async ({ input }) => {
				const deleted = await TenantDomain.findOneAndDelete({
					_id: input.domainId,
					tenantId: input.tenantId,
				}).lean<{ _id: string } | null>();

				if (!deleted) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Domain not found.",
					});
				}

				return { id: String(deleted._id) };
			}),
	}),
	users: router({
		search: adminProcedure.input(userSearchInput).query(async ({ input }) => {
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
			const tenantMap = new Map(
				tenants.map((tenant) => [tenant._id, tenant.name]),
			);

			return {
				count: users.length,
				users: users.map((user) => ({
					id: user._id,
					email: user.email,
					tenantId: user.tenantId ?? null,
					tenantName: user.tenantId
						? (tenantMap.get(user.tenantId) ?? null)
						: null,
					createdAt: user.createdAt,
				})),
			};
		}),
		updateTenant: adminProcedure
			.input(userTenantUpdateInput)
			.mutation(async ({ input }) => {
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
			}),
	}),
});
