import { z } from "zod";

export const tenantInput = z.object({
	name: z.string().min(1),
	logoUrl: z.string().url().optional().nullable(),
	domains: z.array(z.string().min(1)).min(1),
});

export const domainInput = z.object({
	tenantId: z.string().min(1),
	domain: z.string().min(1),
});

export const domainRemoveInput = z.object({
	tenantId: z.string().min(1),
	domainId: z.string().min(1),
});

export const tenantUpdateInput = z.object({
	tenantId: z.string().min(1),
	name: z.string().min(1).optional(),
	logoUrl: z.string().url().nullable().optional(),
});

export const tenantListInput = z
	.object({
		query: z.string().min(1).optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.optional();

export const userSearchInput = z
	.object({
		query: z.string().optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.optional();

export const userTenantUpdateInput = z.object({
	userId: z.string().min(1),
	tenantId: z.string().nullable(),
});
