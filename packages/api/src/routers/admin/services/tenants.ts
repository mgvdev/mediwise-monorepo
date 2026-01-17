import { randomUUID } from "node:crypto";
import { Tenant, TenantDomain } from "@mediwise-monorepo/db";
import { extractEmailDomain, normalizeDomain } from "@mediwise-monorepo/domain";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import type {
	domainInput,
	domainRemoveInput,
	tenantInput,
	tenantListInput,
	tenantUpdateInput,
} from "../dto";

type TenantInput = z.infer<typeof tenantInput>;
type TenantUpdateInput = z.infer<typeof tenantUpdateInput>;
type TenantListInput = z.infer<typeof tenantListInput>;
type DomainInput = z.infer<typeof domainInput>;
type DomainRemoveInput = z.infer<typeof domainRemoveInput>;

/**
 * List tenants with their domains (admin view).
 */
export async function listTenants(input?: TenantListInput) {
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
}

/**
 * Create a tenant and its initial domains, with uniqueness checks.
 */
export async function createTenant(input: TenantInput) {
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
				.map((domain) => extractEmailDomain(domain) ?? normalizeDomain(domain))
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
}

/**
 * Update tenant metadata with validation and conflict checks.
 */
export async function updateTenant(input: TenantUpdateInput) {
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
}

/**
 * Attach a domain to an existing tenant.
 */
export async function addTenantDomain(input: DomainInput) {
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
}

/**
 * Detach a domain from a tenant.
 */
export async function removeTenantDomain(input: DomainRemoveInput) {
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
}
