import { Card, Chip } from "@heroui/react";

import { BackofficeLoginForm } from "@/components/backoffice/login-form";

export function BackofficeLoginScreen() {
	return (
		<div className="bg-background-tertiary text-foreground relative min-h-svh overflow-hidden">
			<div className="relative z-10 mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="space-y-8">
					<div className="space-y-3">
						<Chip size="sm" variant="soft" color="success">
							Mediwise Backoffice
						</Chip>
						<h1 className="text-4xl leading-tight font-semibold text-balance md:text-5xl">
							Centralize intake forms and insurer workflows.
						</h1>
						<p className="text-muted-foreground max-w-xl text-base">
							Manage the shared questionnaire, review member submissions, and
							keep tenant operations aligned — all in one clean workspace.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="border-border/60 bg-card rounded-2xl border p-4 shadow-sm">
							<p className="text-muted-foreground text-xs tracking-wide uppercase">
								Domain gated
							</p>
							<p className="text-foreground mt-2 text-sm">
								Only verified corporate emails can access backoffice data.
							</p>
						</Card>
						<Card className="border-border/60 bg-card rounded-2xl border p-4 shadow-sm">
							<p className="text-muted-foreground text-xs tracking-wide uppercase">
								Live preview
							</p>
							<p className="text-foreground mt-2 text-sm">
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
