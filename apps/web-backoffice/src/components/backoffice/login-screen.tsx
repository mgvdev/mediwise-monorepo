import { Card, Chip } from "@heroui/react";

import { BackofficeLoginForm } from "@/components/backoffice/login-form";

export function BackofficeLoginScreen() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-[-10%] -left-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.25),transparent_70%)]" />
				<div className="absolute -right-24 bottom-[-25%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_60%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.95),rgba(15,23,42,0.65),rgba(2,6,23,0.95))]" />
			</div>

			<div className="relative z-10 mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="space-y-8">
					<div className="space-y-3">
						<Chip size="sm" variant="soft" color="success">
							Mediwise Backoffice
						</Chip>
						<h1 className="text-balance font-semibold text-4xl leading-tight md:text-5xl">
							Centralize intake forms and insurer workflows.
						</h1>
						<p className="max-w-xl text-base text-muted-foreground">
							Manage the shared questionnaire, review member submissions, and
							keep tenant operations aligned — all in one clean workspace.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Domain gated
							</p>
							<p className="mt-2 text-foreground text-sm">
								Only verified corporate emails can access backoffice data.
							</p>
						</Card>
						<Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Live preview
							</p>
							<p className="mt-2 text-foreground text-sm">
								Iterate on questionnaire JSON and validate changes instantly.
							</p>
						</Card>
					</div>
				</section>

				<section className="flex w-full justify-center lg:justify-end">
					<BackofficeLoginForm />
				</section>
			</div>
		</div>
	);
}
