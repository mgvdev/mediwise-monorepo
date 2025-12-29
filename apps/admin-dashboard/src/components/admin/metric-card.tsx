import { Card } from "@heroui/react";
import type { ReactNode } from "react";

type MetricCardProps = {
	label: string;
	value: ReactNode;
	description?: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
	return (
		<Card className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm">
			<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
				{label}
			</p>
			<p className="mt-3 font-semibold text-3xl">{value}</p>
			{description ? (
				<p className="mt-2 text-muted-foreground text-xs">{description}</p>
			) : null}
		</Card>
	);
}
