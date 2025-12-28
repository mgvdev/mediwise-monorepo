import { createFileRoute } from "@tanstack/react-router";
import OtpSignInForm from "@/components/otp-sign-in-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <OtpSignInForm />;
}
