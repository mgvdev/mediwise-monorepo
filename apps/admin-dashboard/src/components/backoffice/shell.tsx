import type { PropsWithChildren } from "react";

import { AdminBadge } from "@/components/admin/admin-badge";
import { Sidebar } from "@/components/backoffice/sidebar";

type BackofficeShellProps = {
	contentClassName?: string;
};

export function BackofficeShell({
	children,
	contentClassName,
}: PropsWithChildren<BackofficeShellProps>) {
	return (
		<div className="min-h-svh bg-background text-foreground">
			<div className="mx-auto grid min-h-svh w-full max-w-[1400px] grid-cols-1 lg:grid-cols-[260px_1fr]">
				<Sidebar />
				<main
					className={`min-h-svh bg-background px-6 py-8 lg:px-10 ${contentClassName ?? ""}`}
				>
					<div className="flex justify-end">
						<AdminBadge />
					</div>
					<div className="mt-6">{children}</div>
				</main>
			</div>
		</div>
	);
}
