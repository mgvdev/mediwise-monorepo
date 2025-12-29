import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

const tabs = [
	{ to: "/dashboard", label: "Home" },
	{ to: "/ai", label: "AI Assistant" },
	{ to: "/documents", label: "Documents" },
	{ to: "/profile", label: "Profile" },
] as const;

export default function TabBar() {
	const baseClasses =
		"flex flex-col items-center gap-1 rounded-xl px-2 py-2 font-medium text-[11px] text-muted-foreground transition hover:text-foreground";

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-20 border-border/60 border-t bg-background/80 backdrop-blur">
			<div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 px-4 py-2">
				{tabs.map((tab) => (
					<Link
						key={tab.to}
						to={tab.to}
						className={({ isActive }) =>
							cn(baseClasses, isActive && "bg-muted/40 text-foreground")
						}
					>
						<span className="text-[10px] uppercase tracking-[0.2em]">
							{tab.label}
						</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
