import { View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { DotChip, type DotChipStatus } from "@/components/base/dot-chip";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { VerticalStack } from "@/components/layout/stack";

export type InteractionAlertItem = {
	type: "drug_drug" | "drug_allergy";
	severity: "info" | "warning" | "danger";
	a: string;
	b: string;
	description: string;
	source: "curated" | "ai";
};

const SEVERITY_TO_STATUS: Record<
	InteractionAlertItem["severity"],
	DotChipStatus
> = {
	info: "normal",
	warning: "warning",
	danger: "danger",
};

const SEVERITY_LABEL: Record<InteractionAlertItem["severity"], string> = {
	info: "Info",
	warning: "Attention",
	danger: "Danger",
};

function pairLabel(item: InteractionAlertItem) {
	return item.type === "drug_allergy"
		? `${item.a} ✕ allergie : ${item.b}`
		: `${item.a} ✕ ${item.b}`;
}

export function InteractionAlert({
	items,
	disclaimer,
}: {
	items: InteractionAlertItem[];
	disclaimer?: string | null;
}) {
	if (!items.length) return null;

	return (
		<Card variant="outline">
			<CardHeader>
				<CardTitle>Alertes d'interaction</CardTitle>
			</CardHeader>
			<CardBody className="gap-3">
				<VerticalStack className="gap-3">
					{items.map((item) => (
						<View key={`${item.type}-${item.a}-${item.b}`} className="gap-1">
							<View className="flex-row items-center justify-between gap-2">
								<BodyStrong className="flex-1">{pairLabel(item)}</BodyStrong>
								<DotChip
									status={SEVERITY_TO_STATUS[item.severity]}
									label={SEVERITY_LABEL[item.severity]}
								/>
							</View>
							<Body className="text-muted">{item.description}</Body>
							{item.source === "ai" ? (
								<Caption>Source : analyse IA (indicatif)</Caption>
							) : null}
						</View>
					))}
				</VerticalStack>
				<Caption>
					{disclaimer ?? "Informations fournies à titre indicatif."} Consultez
					votre médecin ou pharmacien.
				</Caption>
			</CardBody>
		</Card>
	);
}
