import { Button, Card, Input, Label } from "@heroui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { TenantCard } from "@/components/admin/tenant-card";
import { TenantCreate } from "@/components/admin/tenant-create";
import { PageHeader } from "@/components/backoffice/page-header";
import { cardVariants } from "@/components/ui/card";
import { useInsurer } from "@/features/insurer/useInsurer";
import { authClient } from "@/lib/auth-client";

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
	const {
		handleAddDomain,
		handleRemoveDomain,
		handleUpdate,
		handleCreate,
		handleSearch,
		searchTerm,
		setSearchTerm,
		tenantsQuery,
		pendingTenantId,
		pendingDomainId,
		pendingUpdateId,
		createMutation,
		addDomainMutation,
		updateMutation,
	} = useInsurer();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Insurer Operations"
				title="Insurance plans"
				description="Create insurers and manage which domains can access their dashboard."
			/>

			<Card className={cardVariants()}>
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
							value={searchTerm ?? ""}
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
