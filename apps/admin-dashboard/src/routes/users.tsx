import { Button, Card, Chip, Input, Label } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { UserTable } from "@/components/admin/user-table";
import { PageHeader } from "@/components/backoffice/page-header";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/users")({
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
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);

	const usersQuery = useQuery(
		trpc.admin.users.search.queryOptions({ query, limit: 50 }),
	);
	const tenantsQuery = useQuery(trpc.admin.tenants.list.queryOptions());

	const updateMutation = useMutation(
		trpc.admin.users.updateTenant.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("User updated.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to update user.");
			},
			onSettled: () => {
				setPendingUserId(null);
			},
		}),
	);

	const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		setQuery(searchTerm.trim());
	};

	const handleUpdateTenant = (userId: string, tenantId: string | null) => {
		setPendingUserId(userId);
		updateMutation.mutate({ userId, tenantId });
	};

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Member Operations"
				title="Users"
				description="Search members by email and adjust insurer assignment."
				actions={
					<Chip variant="soft">{usersQuery.data?.count ?? 0} users</Chip>
				}
			/>

			<Card className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<form
					className="flex flex-wrap items-end gap-3"
					onSubmit={handleSearch}
				>
					<div className="flex-1 space-y-2">
						<Label htmlFor="user-search">Search by email</Label>
						<Input
							id="user-search"
							fullWidth
							isOnSurface
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="member@email.com"
						/>
					</div>
					<Button type="submit" isDisabled={usersQuery.isLoading}>
						Search
					</Button>
				</form>
			</Card>

			<UserTable
				users={usersQuery.data?.users ?? []}
				tenants={(tenantsQuery.data ?? []).map((tenant) => ({
					id: tenant.id,
					name: tenant.name,
				}))}
				onUpdateTenant={handleUpdateTenant}
				pendingUserId={pendingUserId}
			/>
		</div>
	);
}
