import { Button, Card, Input, Label } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { TenantCard } from "@/components/admin/tenant-card";
import { TenantCreate } from "@/components/admin/tenant-create";
import { PageHeader } from "@/components/backoffice/page-header";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/insurers")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [searchTerm, setSearchTerm] = useState("");
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
		setQuery(searchTerm.trim());
	};

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Insurer Operations"
				title="Insurance plans"
				description="Create insurers and manage which domains can access their dashboard."
			/>

			<Card className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<form
					className="flex flex-wrap items-end gap-3"
					onSubmit={handleSearch}
				>
					<div className="flex-1 space-y-2">
						<Label htmlFor="insurer-search">Search insurers</Label>
						<Input
							id="insurer-search"
							fullWidth
							isOnSurface
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Atlas Health"
						/>
					</div>
					<Button type="submit" isDisabled={tenantsQuery.isLoading}>
						Search
					</Button>
				</form>
			</Card>

			<TenantCreate
				onCreate={handleCreate}
				isSubmitting={createMutation.isPending}
			/>

			{tenantsQuery.isLoading ? (
				<p className="text-muted-foreground text-sm">Loading insurers...</p>
			) : tenantsQuery.data?.length ? (
				<div className="grid gap-4 lg:grid-cols-2">
					{tenantsQuery.data.map((tenant) => (
						<TenantCard
							key={tenant.id}
							tenant={tenant}
							onAddDomain={handleAddDomain}
							onRemoveDomain={handleRemoveDomain}
							onUpdate={handleUpdate}
							isSubmitting={
								addDomainMutation.isPending && pendingTenantId === tenant.id
							}
							isUpdating={
								updateMutation.isPending && pendingUpdateId === tenant.id
							}
							pendingDomainId={pendingDomainId}
						/>
					))}
				</div>
			) : (
				<p className="text-muted-foreground text-sm">
					No insurers match this search yet.
				</p>
			)}
		</div>
	);
}
