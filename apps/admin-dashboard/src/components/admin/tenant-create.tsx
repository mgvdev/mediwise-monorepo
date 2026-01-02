import { Button, Card, Input, Label } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import { cardVariants } from "@/components/ui/card";

type TenantCreateProps = {
	onCreate: (input: {
		name: string;
		logoUrl: string | null;
		domains: string[];
	}) => void;
	isSubmitting?: boolean;
};

export function TenantCreate({ onCreate, isSubmitting }: TenantCreateProps) {
	const [name, setName] = useState("");
	const [logoUrl, setLogoUrl] = useState("");
	const [domainInput, setDomainInput] = useState("");
	const [error, setError] = useState<string | null>(null);

	const domains = useMemo(
		() =>
			domainInput
				.split(/[\s,]+/)
				.map((domain) => domain.trim())
				.filter(Boolean),
		[domainInput],
	);

	useEffect(() => {
		if (error) {
			setError(null);
		}
	}, [name, domainInput, logoUrl, error]);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		const trimmed = name.trim();
		if (!trimmed) {
			setError("Insurer name is required.");
			return;
		}
		if (!domains.length) {
			setError("Add at least one domain.");
			return;
		}
		onCreate({
			name: trimmed,
			logoUrl: logoUrl.trim() || null,
			domains,
		});
		setName("");
		setLogoUrl("");
		setDomainInput("");
	};

	return (
		<Card className={cardVariants()}>
			<Card.Header>
				<div>
					<p className="font-semibold text-sm">Create insurance plan</p>
					<p className="text-muted-foreground text-xs">
						Add insurer metadata and the domains allowed to sign in.
					</p>
				</div>
			</Card.Header>
			<Card.Content className="mt-4">
				<form
					className="grid gap-4 lg:grid-cols-[2fr_2fr] lg:items-end"
					onSubmit={handleSubmit}
				>
					<div className="space-y-2">
						<Label htmlFor="tenant-name">Insurer name</Label>
						<Input
							id="tenant-name"
							fullWidth
							isOnSurface
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Atlas Health"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="tenant-logo">Logo URL (optional)</Label>
						<Input
							id="tenant-logo"
							type="url"
							fullWidth
							isOnSurface
							value={logoUrl}
							onChange={(event) => setLogoUrl(event.target.value)}
							placeholder="https://cdn.mediwise.com/logos/atlas.svg"
						/>
					</div>
					<div className="space-y-2 lg:col-span-2">
						<Label htmlFor="tenant-domains">Authorized domains</Label>
						<Input
							id="tenant-domains"
							fullWidth
							isOnSurface
							value={domainInput}
							onChange={(event) => setDomainInput(event.target.value)}
							placeholder="atlashealth.com, atlas.co"
						/>
						<p className="text-muted-foreground text-xs">
							Separate multiple domains with commas or spaces.
						</p>
						{error ? <p className="text-destructive text-xs">{error}</p> : null}
					</div>
					<div className="lg:col-span-2">
						<Button
							type="submit"
							isDisabled={!name.trim() || !domains.length || isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create plan"}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card>
	);
}
