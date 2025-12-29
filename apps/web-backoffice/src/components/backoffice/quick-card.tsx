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
			<Card className="h-full rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm transition hover:border-primary/40">
				<div className="flex items-center gap-3">
					{icon ? (
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							{icon}
						</div>
					) : null}
					<div>
						<p className="font-semibold text-sm">{title}</p>
						<p className="mt-1 text-muted-foreground text-xs">{description}</p>
					</div>
				</div>
			</Card>
		</Link>
	);
}
