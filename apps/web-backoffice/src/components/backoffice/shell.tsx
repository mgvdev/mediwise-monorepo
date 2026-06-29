import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/backoffice/sidebar";

type BackofficeShellProps = {
	contentClassName?: string;
};

export function BackofficeShell({
	children,
	contentClassName,
}: PropsWithChildren<BackofficeShellProps>) {
	return (
		<div className="bg-background text-foreground min-h-svh">
			<div className="mx-auto grid min-h-svh w-full max-w-[1400px] grid-cols-1 lg:grid-cols-[260px_1fr]">
				<Sidebar />
				<main
					className={`bg-background min-h-svh px-6 py-8 lg:px-10 ${contentClassName ?? ""}`}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
