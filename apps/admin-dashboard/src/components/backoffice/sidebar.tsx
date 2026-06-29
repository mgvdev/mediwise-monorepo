import { Avatar, Button, Card } from "@heroui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, ClipboardList, Home, Users } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
	{ to: "/dashboard", label: "Overview", icon: Home },
	{ to: "/insurers", label: "Insurers", icon: Building2 },
	{ to: "/users", label: "Users", icon: Users },
	{ to: "/questionnaire", label: "Questionnaire", icon: ClipboardList },
] as const;

export function Sidebar() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	return (
		<aside className="border-border/60 bg-background flex h-full flex-col border-r px-5 py-6 lg:sticky lg:top-0 lg:min-h-svh">
			<div className="flex items-center gap-2">
				<div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-2xl">
					<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12 3c2.2 0 4 1.8 4 4v2h2a2 2 0 0 1 2 2v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a2 2 0 0 1 2-2h2V7c0-2.2 1.8-4 4-4Zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2Zm-5 6v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-5H7Z"
						/>
					</svg>
				</div>
				<div>
					<p className="font-semibold">Mediwise</p>
					<p className="text-muted-foreground text-xs">Admin console</p>
				</div>
			</div>

			<nav className="mt-6 flex flex-1 flex-col gap-1">
				{navItems.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							cn(
								"hover:bg-foreground/5 flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
								isActive && "bg-primary/10 text-primary",
							)
						}
					>
						<span className="flex items-center gap-3">
							<item.icon className="h-4 w-4" />
							{item.label}
						</span>
					</Link>
				))}
			</nav>

			<Card className="border-border/60 bg-card/50 mt-6 rounded-2xl border p-4">
				<p className="text-sm font-semibold">Admin scope</p>
				<p className="text-muted-foreground mt-1 text-xs">
					Manage insurers, domains, and member access from one place.
				</p>
			</Card>

			<div className="border-border/60 bg-card/50 mt-6 flex items-center justify-between rounded-2xl border p-3">
				<div className="flex items-center gap-3">
					<Avatar size="sm" name={session?.user.email ?? "Backoffice"} />
					<div>
						<p className="text-sm font-medium">
							{session?.user.email ?? "Signed out"}
						</p>
						<p className="text-muted-foreground text-xs">Super admin</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="sm"
					isDisabled={!session?.user}
					onPress={async () => {
						await authClient.signOut();
						toast.success("Signed out.");
						navigate({ to: "/login" });
					}}
				>
					Log out
				</Button>
			</div>
		</aside>
	);
}
