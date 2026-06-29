import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

export function useInsurer() {
	const [searchTerm, setSearchTerm] = useQueryState("");
	const [query, setQuery] = useState("");
	const tenantsQuery = useQuery(
		trpc.admin.tenants.list.queryOptions({
			query: query.trim() || undefined,
			limit: 100,
		}),
	);
	const [pendingTenantId, setPendingTenantId] = useState<string | null>(null);
	const [pendingDomainId, setPendingDomainId] = useState<string | null>(null);
	const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);

	const createMutation = useMutation(
		trpc.admin.tenants.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("Insurer created.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to create insurer.");
			},
		}),
	);

	const addDomainMutation = useMutation(
		trpc.admin.tenants.addDomain.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("Domain added.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to add domain.");
			},
			onSettled: () => {
				setPendingTenantId(null);
			},
		}),
	);

	const removeDomainMutation = useMutation(
		trpc.admin.tenants.removeDomain.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("Domain removed.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to remove domain.");
			},
			onSettled: () => {
				setPendingDomainId(null);
			},
		}),
	);

	const updateMutation = useMutation(
		trpc.admin.tenants.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("Insurer updated.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to update insurer.");
			},
			onSettled: () => {
				setPendingUpdateId(null);
			},
		}),
	);

	const handleCreate = (input: {
		name: string;
		logoUrl: string | null;
		domains: string[];
	}) => {
		createMutation.mutate(input);
	};

	const handleAddDomain = (tenantId: string, domain: string) => {
		setPendingTenantId(tenantId);
		addDomainMutation.mutate({ tenantId, domain });
	};

	const handleRemoveDomain = (tenantId: string, domainId: string) => {
		setPendingDomainId(domainId);
		removeDomainMutation.mutate({ tenantId, domainId });
	};

	const handleUpdate = (
		tenantId: string,
		input: { name: string; logoUrl: string | null },
	) => {
		setPendingUpdateId(tenantId);
		updateMutation.mutate({ tenantId, ...input });
	};

	const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		setQuery(searchTerm?.trim() ?? "");
	};

	return {
		searchTerm,
		setSearchTerm,
		query,
		setQuery,
		tenantsQuery,
		pendingTenantId,
		pendingDomainId,
		pendingUpdateId,
		handleCreate,
		handleAddDomain,
		handleRemoveDomain,
		handleUpdate,
		handleSearch,
		createMutation,
		addDomainMutation,
		updateMutation,
	};
}
