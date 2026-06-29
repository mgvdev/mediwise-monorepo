import { createFileRoute } from "@tanstack/react-router";

import { BackofficeLoginScreen } from "@/components/backoffice/login-screen";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <BackofficeLoginScreen />;
}
