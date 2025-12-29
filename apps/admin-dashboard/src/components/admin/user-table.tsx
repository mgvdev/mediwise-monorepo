import { Button, Card, Chip } from "@heroui/react";
import { useEffect, useState } from "react";

type TenantOption = {
	id: string;
	name: string;
};

type UserRow = {
	id: string;
	email: string;
	tenantId: string | null;
	tenantName: string | null;
};

type UserTableProps = {
	users: UserRow[];
	tenants: TenantOption[];
	onUpdateTenant: (userId: string, tenantId: string | null) => void;
	pendingUserId?: string | null;
};

export function UserTable({
	users,
	tenants,
	onUpdateTenant,
	pendingUserId,
}: UserTableProps) {
	const [selection, setSelection] = useState<Record<string, string>>({});

	useEffect(() => {
		const initial: Record<string, string> = {};
		for (const user of users) {
			if (user.tenantId) {
				initial[user.id] = user.tenantId;
			}
		}
		setSelection(initial);
	}, [users]);

	return (
		<Card className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm">
			<div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 text-muted-foreground text-xs uppercase tracking-[0.2em]">
				<span>Member</span>
				<span>Insurer</span>
				<span>Status</span>
				<span>Actions</span>
			</div>

			<div className="mt-4 divide-y divide-border/60">
				{users.length ? (
					users.map((user) => {
						const selectedTenant = selection[user.id] ?? "";
						const hasTenant = Boolean(user.tenantId);
						const isPending = pendingUserId === user.id;

						return (
							<div
								key={user.id}
								className="grid grid-cols-1 gap-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]"
							>
								<div>
									<p className="font-medium text-sm">{user.email}</p>
									{user.tenantName ? (
										<p className="text-muted-foreground text-xs">
											Current insurer: {user.tenantName}
										</p>
									) : (
										<p className="text-muted-foreground text-xs">
											No insurer assigned yet.
										</p>
									)}
								</div>
								<div>
									<select
										className="h-9 w-full rounded-xl border border-border/60 bg-background px-3 text-foreground text-sm"
										value={selectedTenant}
										onChange={(event) => {
											setSelection((previous) => ({
												...previous,
												[user.id]: event.target.value,
											}));
										}}
									>
										<option value="">Select insurer</option>
										{tenants.map((tenant) => (
											<option key={tenant.id} value={tenant.id}>
												{tenant.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<Chip
										variant="soft"
										color={hasTenant ? "success" : "warning"}
									>
										{hasTenant ? "Assigned" : "Unassigned"}
									</Chip>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Button
										size="sm"
										onPress={() =>
											onUpdateTenant(user.id, selectedTenant || null)
										}
										isDisabled={isPending || (!selectedTenant && !hasTenant)}
									>
										{isPending ? "Updating..." : "Save"}
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onPress={() => onUpdateTenant(user.id, null)}
										isDisabled={isPending || !hasTenant}
									>
										Clear
									</Button>
								</div>
							</div>
						);
					})
				) : (
					<p className="py-6 text-muted-foreground text-sm">
						No users found for this search.
					</p>
				)}
			</div>
		</Card>
	);
}
