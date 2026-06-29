import { Card } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type QuickCardProps = {
	to: string;
	title: string;
	description: string;
	icon?: ReactNode;
};

export function QuickCard({ to, title, description, icon }: QuickCardProps) {
	return (
		<Link to={to} className="block">
			<Card className="border-border/60 bg-card/60 hover:border-primary/40 h-full rounded-2xl border p-4 shadow-sm transition">
				<div className="flex items-center gap-3">
					{icon ? (
						<div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
							{icon}
						</div>
					) : null}
					<div>
						<p className="text-sm font-semibold">{title}</p>
						<p className="text-muted-foreground mt-1 text-xs">{description}</p>
					</div>
				</div>
			</Card>
		</Link>
	);
}
