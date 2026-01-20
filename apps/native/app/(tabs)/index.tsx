import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Surface, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

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

export default function Home() {
	const primary = useThemeColor("primary");
	const muted = useThemeColor("muted");

	return (
		<Container className="gap-6 px-6 pt-12 pb-10">
			<View className="gap-2">
				<Text className="text-muted text-xs">Health profile</Text>
				<Text className="font-semibold text-2xl text-foreground">
					Your health summary
				</Text>
				<Text className="text-muted text-sm">
					Answer a few questions to personalize your care.
				</Text>
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
										<Text className="font-semibold text-foreground text-sm">
											{category.label}
										</Text>
										<Text className="text-muted text-xs">
											Open questionnaire
										</Text>
									</View>
									<Ionicons name="chevron-forward" size={18} color={muted} />
								</View>
							</Surface>
						</Pressable>
					);
				})}
			</View>
		</Container>
	);
}
