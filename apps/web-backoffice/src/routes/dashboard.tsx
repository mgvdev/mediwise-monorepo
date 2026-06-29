import { Card, Chip } from "@heroui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { FileText, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/backoffice/page-header";
import { QuickCard } from "@/components/backoffice/quick-card";
import { authClient } from "@/lib/auth-client";

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
	return (
		<div className="flex flex-col gap-8">
			<PageHeader
				eyebrow="Mediwise Backoffice"
				title="Home"
				description="Quick access to shared admin tools."
				actions={<Chip variant="soft">Live</Chip>}
			/>

			<div className="grid gap-4 lg:grid-cols-3">
				<QuickCard
					to="/documents"
					title="Documents"
					description="Review prescription uploads and AI extraction status."
					icon={<FileText className="h-4 w-4" />}
				/>
				<QuickCard
					to="/ai"
					title="AI Assistant"
					description="Check the assistant prompts running in production."
					icon={<Sparkles className="h-4 w-4" />}
				/>
			</div>

			<Card className="border-border/60 bg-card/70 rounded-3xl border p-6 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-sm font-semibold">Today’s highlights</p>
						<p className="text-muted-foreground text-xs">
							Member activity and document processing summary.
						</p>
					</div>
					<div className="flex gap-3">
						<Chip variant="soft" color="success">
							12 active members
						</Chip>
						<Chip variant="soft" color="warning">
							3 pending uploads
						</Chip>
					</div>
				</div>
			</Card>
		</div>
	);
}
