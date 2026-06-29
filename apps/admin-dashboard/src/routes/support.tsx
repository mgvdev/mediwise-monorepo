import { createFileRoute, redirect } from "@tanstack/react-router";

import { PageHeader } from "@/components/backoffice/page-header";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/support")({
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
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Support"
				title="Help & Support"
				description="Resources and contact options for the backoffice team."
			/>
			<div className="border-border/60 bg-card/70 text-muted-foreground rounded-3xl border p-6 text-sm">
				Support tools will live here.
			</div>
		</div>
	);
}
