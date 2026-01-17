import { Button, Card, Chip, Input } from "@heroui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Home, LifeBuoy, Sparkles, User, Users } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LogoutSection } from "./logout-section";

const navItems = [
	{ to: "/dashboard", label: "Home", icon: Home, badge: "10" },
	{ to: "/documents", label: "Documents", icon: FileText },
	{ to: "/my-insured", label: "My insureds", icon: Users },
	{ to: "/ai", label: "AI Assistant", icon: Sparkles, badge: "2" },
	{ to: "/support", label: "Help & Support", icon: LifeBuoy },
] as const;

export function Sidebar() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const email = session?.user.email ?? null;
	const isSignedIn = Boolean(session?.user);

	return (
		<aside className="flex h-full flex-col border-border/60 border-r bg-background px-5 py-6 lg:sticky lg:top-0 lg:min-h-svh">
			<div className="flex items-center gap-2">
				<div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12 3c2.2 0 4 1.8 4 4v2h2a2 2 0 0 1 2 2v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a2 2 0 0 1 2-2h2V7c0-2.2 1.8-4 4-4Zm0 2a2 2 0 0 0-2 2v2h4V7a2 2 0 0 0-2-2Zm-5 6v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-5H7Z"
						/>
					</svg>
				</div>
				<div>
					<p className="font-semibold">Mediwise</p>
					<p className="text-muted-foreground text-xs">Backoffice</p>
				</div>
			</div>

			<div className="mt-6">
				<Input
					placeholder="Search anything..."
					fullWidth
					isOnSurface
					className="text-sm"
				/>
			</div>

			<nav className="mt-6 flex flex-1 flex-col gap-1">
				{navItems.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							cn(
								"flex items-center justify-between rounded-xl px-3 py-2 text-foreground/80 text-sm transition hover:bg-foreground/5 hover:text-foreground",
								isActive &&
									"bg-primary/15 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]",
							)
						}
					>
						<span className="flex items-center gap-3">
							<item.icon className="h-4 w-4" />
							{item.label}
							{/*{item.badge ? (
                                <Chip size="sm" variant="soft" color="success">
                                    {item.badge}
                                </Chip>
                            ) : null}*/}
						</span>
					</Link>
				))}
			</nav>

			<Card className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-4">
				<p className="font-semibold text-sm">Unlimited access</p>
				<p className="mt-1 text-muted-foreground text-xs">
					Unlock the full patient insights toolkit.
				</p>
				<Button className="mt-3 w-full" size="sm">
					Go Pro
				</Button>
			</Card>

			<LogoutSection
				email={email}
				isSignedIn={isSignedIn}
				onLogout={async () => {
					await authClient.signOut();
					toast.success("Signed out.");
					navigate({ to: "/login" });
				}}
			/>
		</aside>
	);
}
