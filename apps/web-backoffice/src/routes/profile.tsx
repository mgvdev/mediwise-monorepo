import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/profile")({
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
	const { session } = Route.useRouteContext();

	return (
		<div className="flex min-h-[60svh] items-center justify-center">
			<p className="font-medium text-lg">
				Profile{session.data?.user.email ? ` — ${session.data.user.email}` : ""}
			</p>
		</div>
	);
}
