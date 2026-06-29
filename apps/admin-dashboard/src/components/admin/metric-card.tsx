import { Card } from "@heroui/react";
import type { ReactNode } from "react";

import { cardVariants } from "@/components/ui/card";

type MetricCardProps = {
	label: string;
	value: ReactNode;
	description?: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
	return (
		<Card className={cardVariants()}>
			<p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
				{label}
			</p>
			<p className="mt-3 text-3xl font-semibold">{value}</p>
			{description ? (
				<p className="text-muted-foreground mt-2 text-xs">{description}</p>
			) : null}
		</Card>
	);
}
