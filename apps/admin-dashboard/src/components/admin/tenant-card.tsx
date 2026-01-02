import { Avatar, Button, Card, Chip, Input, Label } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import { cardVariants } from "@/components/ui/card";

type TenantDomain = {
	id: string;
	domain: string;
	status: string;
};

type TenantCardProps = {
	tenant: {
		id: string;
		name: string;
		logoUrl?: string | null;
		status: string;
		createdAt: string | Date;
		domains: TenantDomain[];
	};
	onAddDomain: (tenantId: string, domain: string) => void;
	onRemoveDomain: (tenantId: string, domainId: string) => void;
	onUpdate: (
		tenantId: string,
		input: { name: string; logoUrl: string | null },
	) => void;
	isSubmitting?: boolean;
	isUpdating?: boolean;
	pendingDomainId?: string | null;
};

function formatDate(value: string | Date) {
	const date = typeof value === "string" ? new Date(value) : value;
	return date.toLocaleDateString();
}

export function TenantCard({
	tenant,
	onAddDomain,
	onRemoveDomain,
	onUpdate,
	isSubmitting,
	isUpdating,
	pendingDomainId,
}: TenantCardProps) {
	const [domainInput, setDomainInput] = useState("");
	const [name, setName] = useState(tenant.name);
	const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? "");

	useEffect(() => {
		setName(tenant.name);
		setLogoUrl(tenant.logoUrl ?? "");
	}, [tenant.name, tenant.logoUrl]);

	const hasChanges = useMemo(() => {
		return (
			name.trim() !== tenant.name ||
			(logoUrl.trim() || "") !== (tenant.logoUrl ?? "")
		);
	}, [logoUrl, name, tenant.logoUrl, tenant.name]);

	const handleAddDomain = () => {
		const trimmed = domainInput.trim();
		if (!trimmed) return;
		onAddDomain(tenant.id, trimmed);
		setDomainInput("");
	};

	const handleUpdate = () => {
		const trimmedName = name.trim();
		if (!trimmedName) return;
		onUpdate(tenant.id, { name: trimmedName, logoUrl: logoUrl.trim() || null });
	};

	return (
		<Card className={cardVariants()}>
			<Card.Header className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<Avatar
						name={tenant.name}
						src={tenant.logoUrl ?? undefined}
						size="sm"
					/>
					<div>
						<p className="font-semibold text-lg">{tenant.name}</p>
						<p className="text-muted-foreground text-xs">
							Created {formatDate(tenant.createdAt)}
						</p>
					</div>
				</div>
				<Chip
					variant="soft"
					color={tenant.status === "active" ? "success" : "warning"}
				>
					{tenant.status}
				</Chip>
			</Card.Header>

			<Card.Content className="mt-4 space-y-4">
				<div>
					<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
						Authorized domains
					</p>
					{tenant.domains.length ? (
						<div className="mt-2 space-y-2">
							{tenant.domains.map((domain) => (
								<div
									key={domain.id}
									className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm"
								>
									<span>{domain.domain}</span>
									<Button
										size="sm"
										variant="ghost"
										onPress={() => onRemoveDomain(tenant.id, domain.id)}
										isDisabled={pendingDomainId === domain.id}
									>
										{pendingDomainId === domain.id ? "Removing..." : "Remove"}
									</Button>
								</div>
							))}
						</div>
					) : (
						<p className="mt-2 text-muted-foreground text-sm">
							No domains yet.
						</p>
					)}
				</div>

				<div className="flex flex-wrap items-end gap-3">
					<div className="flex-1 space-y-2">
						<Label htmlFor={`domain-${tenant.id}`}>Add domain</Label>
						<Input
							id={`domain-${tenant.id}`}
							fullWidth
							isOnSurface
							placeholder="insurer.com"
							value={domainInput}
							onChange={(event) => setDomainInput(event.target.value)}
						/>
					</div>
					<Button
						onPress={handleAddDomain}
						isDisabled={!domainInput.trim() || isSubmitting}
					>
						{isSubmitting ? "Adding..." : "Add domain"}
					</Button>
				</div>

				<div className="grid gap-3 md:grid-cols-[1.4fr_1.6fr_auto] md:items-end">
					<div className="space-y-2">
						<Label htmlFor={`tenant-name-${tenant.id}`}>Insurer name</Label>
						<Input
							id={`tenant-name-${tenant.id}`}
							fullWidth
							isOnSurface
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={`tenant-logo-${tenant.id}`}>Logo URL</Label>
						<Input
							id={`tenant-logo-${tenant.id}`}
							fullWidth
							isOnSurface
							value={logoUrl}
							onChange={(event) => setLogoUrl(event.target.value)}
							placeholder="https://cdn.mediwise.com/logo.svg"
						/>
					</div>
					<Button onPress={handleUpdate} isDisabled={!hasChanges || isUpdating}>
						{isUpdating ? "Saving..." : "Save details"}
					</Button>
				</div>
			</Card.Content>
		</Card>
	);
}
