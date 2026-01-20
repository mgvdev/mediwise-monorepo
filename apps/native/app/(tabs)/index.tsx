import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Surface, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import {
	BodyMuted,
	BodyStrong,
	Caption,
	H1,
	Link,
} from "@/components/base/typography";
import {
	RecapBuilderModal,
	type RecapSection,
} from "@/components/features/recap/recap-builder-button";
import { Container } from "@/components/layout/container";
import { applyOpacity } from "@/components/utils";
import { healthCategories } from "../health/health-schema";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
	personal_information: "person-outline",
	vital_signs: "pulse-outline",
	allergies: "leaf-outline",
	family_history: "people-outline",
	surgical_history: "cut-outline",
	cardiology: "heart-outline",
	pulmonology: "cloud-outline",
	neurology: "hardware-chip-outline",
	endocrinology: "flask-outline",
	psychiatry: "chatbubble-ellipses-outline",
	gynecology: "female-outline",
	obstetrics: "male-female-outline",
};

const RECAP_SECTIONS: RecapSection[] = [
	{
		id: "personnal_information",
		label: "Personal information",
		description: "Basics about you",
	},
	{
		id: "prescriptions",
		label: "Prescriptions",
		description: "Current medications and dosage",
	},
	{
		id: "allergies",
		label: "Allergies",
		description: "Known drug or food allergies",
	},
	{
		id: "conditions",
		label: "Conditions",
		description: "Ongoing medical conditions",
	},
	{
		id: "tests",
		label: "Recent tests",
		description: "Latest lab results or scans",
	},
];

export default function Home() {
	const primary = useThemeColor("primary");
	const muted = useThemeColor("muted");
	const [recapOpen, setRecapOpen] = useState(false);
	const [recapSelectedIds, setRecapSelectedIds] = useState(
		RECAP_SECTIONS.map((section) => section.id),
	);

	return (
		<Container className="gap-6 px-6 pt-12 pb-16">
			<View className="gap-2">
				<Caption>Health profile</Caption>
				<H1>Your health summary</H1>
				<BodyMuted>Answer a few questions to personalize your care.</BodyMuted>
			</View>
			<View className="my-4">
				<Pressable
					onPress={() => setRecapOpen(true)}
					className="flex-row items-center justify-center gap-2 rounded-full border border-primary px-4 py-2"
				>
					<Ionicons name="share-social-outline" size={18} color={primary} />
					<Link>Share recap</Link>
				</Pressable>
			</View>

			<View className="gap-3">
				{healthCategories.map((category) => {
					const icon = CATEGORY_ICONS[category.key] ?? "medkit-outline";

					return (
						<Pressable
							key={category.key}
							onPress={() =>
								router.push({
									pathname: "/health/[category]",
									params: { category: category.key },
								})
							}
							className="rounded-2xl"
						>
							<Surface variant="secondary" className="rounded-2xl p-4">
								<View className="flex-row items-center gap-3">
									<View
										className="h-10 w-10 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												applyOpacity(primary, 0.12) ?? "transparent",
											borderColor: applyOpacity(primary, 0.35) ?? primary,
											borderWidth: 1,
										}}
									>
										<Ionicons name={icon} size={18} color={primary} />
									</View>
									<View className="flex-1">
										<BodyStrong>{category.label}</BodyStrong>
										<Caption>Open questionnaire</Caption>
									</View>
									<Ionicons name="chevron-forward" size={18} color={muted} />
								</View>
							</Surface>
						</Pressable>
					);
				})}
			</View>
			<RecapBuilderModal
				open={recapOpen}
				onClose={() => setRecapOpen(false)}
				sections={RECAP_SECTIONS}
				selectedIds={recapSelectedIds}
				onSelectedIdsChange={setRecapSelectedIds}
			/>
		</Container>
	);
}
