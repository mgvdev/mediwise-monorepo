import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/ai", label: "AI Insights" },
	] as const;

	return (
		<header className="border-border/60 border-b bg-background/80 backdrop-blur">
			<div className="flex flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-6">
					<Link
						to="/"
						className="font-semibold text-sm uppercase tracking-[0.2em]"
					>
						Mediwise
					</Link>
					<nav className="flex gap-4 text-muted-foreground text-sm">
						{links.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className="transition hover:text-foreground"
							>
								{label}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
