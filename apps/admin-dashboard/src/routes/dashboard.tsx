import { Card, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Building2, ClipboardList, Users } from "lucide-react";

import { MetricCard } from "@/components/admin/metric-card";
import { PageHeader } from "@/components/backoffice/page-header";
import { QuickCard } from "@/components/backoffice/quick-card";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
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
	const statsQuery = useQuery(trpc.admin.stats.queryOptions());

	return (
		<div className="flex flex-col gap-8">
			<PageHeader
				eyebrow="Mediwise Admin"
				title="Overview"
				description="Monitor insurers, members, and shared operational flows."
				actions={<Chip variant="soft">Live</Chip>}
			/>

			<div className="grid gap-4 lg:grid-cols-3">
				<MetricCard
					label="Total members"
					value={statsQuery.data?.users ?? "—"}
					description="Active users in the system."
				/>
				<MetricCard
					label="Insurers"
					value={statsQuery.data?.insurers ?? "—"}
					description="Insurance plans onboarded."
				/>
				<MetricCard
					label="Authorized domains"
					value={statsQuery.data?.domains ?? "—"}
					description="Domains allowed on insurer dashboards."
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<QuickCard
					to="/insurers"
					title="Insurers"
					description="Create insurance plans and manage dashboard domains."
					icon={<Building2 className="h-4 w-4" />}
				/>
				<QuickCard
					to="/users"
					title="Users"
					description="Search members and update insurer assignment."
					icon={<Users className="h-4 w-4" />}
				/>
				<QuickCard
					to="/questionnaire"
					title="Questionnaire"
					description="Edit the shared intake questionnaire."
					icon={<ClipboardList className="h-4 w-4" />}
				/>
			</div>

			<Card className="border-border/60 bg-card/70 rounded-3xl border p-6 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-sm font-semibold">Admin focus</p>
						<p className="text-muted-foreground text-xs">
							Track insurer onboarding and member access changes.
						</p>
					</div>
					<div className="flex gap-3">
						<Chip variant="soft" color="success">
							{statsQuery.data?.insurers ?? 0} insurers live
						</Chip>
						<Chip variant="soft" color="warning">
							{statsQuery.data?.users ?? 0} members indexed
						</Chip>
					</div>
				</div>
			</Card>
		</div>
	);
}
