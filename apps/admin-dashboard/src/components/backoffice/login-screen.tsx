import { Card, Chip } from "@heroui/react";

import { BackofficeLoginForm } from "@/components/backoffice/login-form";

export function BackofficeLoginScreen() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-[-15%] -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.2),transparent_70%)]" />
				<div className="absolute -right-20 bottom-[-20%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18),transparent_65%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.95),rgba(15,23,42,0.65),rgba(2,6,23,0.95))]" />
			</div>

			<div className="relative z-10 mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="space-y-8">
					<div className="space-y-3">
						<Chip size="sm" variant="soft" color="warning">
							Mediwise Admin
						</Chip>
						<h1 className="text-balance font-semibold text-4xl leading-tight md:text-5xl">
							Super-admin console for Mediwise operations.
						</h1>
						<p className="max-w-xl text-base text-muted-foreground">
							Create insurers, approve dashboard domains, and keep core member
							workflows aligned from a single command center.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Insurer onboarding
							</p>
							<p className="mt-2 text-foreground text-sm">
								Activate plans, assign domains, and unlock insurer workspaces.
							</p>
						</Card>
						<Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Targeted actions
							</p>
							<p className="mt-2 text-foreground text-sm">
								Search members, validate insurer assignment, and update access.
							</p>
						</Card>
						<Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Questionnaire control
							</p>
							<p className="mt-2 text-foreground text-sm">
								Ship new intake logic across all insurers in one publish.
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
