import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { AppHeader } from "@/components/base/app-header";
import { SoftHealthBackground } from "@/components/base/backgrounds";
import {
	Card,
	CardAction,
	CardBody,
	CardHeader,
	CardTitle,
} from "@/components/base/card";
import {
	Body,
	BodyMuted,
	BodyStrong,
	Caption,
} from "@/components/base/typography";
import {
	RecapBuilderModal,
	type RecapSection,
} from "@/components/features/recap/recap-builder-button";
import { Container } from "@/components/layout/container";
import { HorizontalStack, VerticalStack } from "@/components/layout/stack";
import { applyOpacity, pressableFeedback } from "@/components/utils";

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
	const primary = useThemeColor("accent");
	const muted = useThemeColor("muted");
	const [recapOpen, setRecapOpen] = useState(false);
	const [recapSelectedIds, setRecapSelectedIds] = useState(
		RECAP_SECTIONS.map((section) => section.id),
	);

	return (
		<View className="flex-1 bg-background">
			<SoftHealthBackground heightRatio={1} />

			<Container className="mb-16 bg-transparent px-6 pt-12 pb-16">
				<AppHeader
					title="Home"
					subtitle="Your health summary"
					score={88}
					statusLabel="Healthy"
					memberLabel="plus Member"
					notificationCount={3}
					showChevron={false}
					variant="dark"
					onPress={() => router.push("/profile")}
				/>
				<VerticalStack className="mt-6">
					<Pressable
						onPress={() => router.push("/health/overview")}
						className="rounded-2xl"
						style={pressableFeedback(undefined, { opacity: 0.9 })}
					>
						<Card className="min-h-[160px]">
							<CardHeader>
								<CardTitle>Medical record</CardTitle>
								<HorizontalStack className="gap-2">
									<CardAction
										onPress={() => setRecapOpen(true)}
										accessibilityRole="button"
										accessibilityLabel="Share recap"
									>
										<Ionicons
											name="share-social-outline"
											size={16}
											color={primary}
										/>
									</CardAction>
									<CardAction
										onPress={() => router.push("/health")}
										accessibilityRole="button"
										accessibilityLabel="Edit medical record"
									>
										<Ionicons name="create-outline" size={16} color={primary} />
									</CardAction>
								</HorizontalStack>
							</CardHeader>
							<CardBody className="mt-2 gap-2">
								<BodyStrong>All your health info, simplified.</BodyStrong>
								<BodyMuted>
									Readable summary of allergies, conditions, and treatments.
								</BodyMuted>
							</CardBody>
						</Card>
					</Pressable>

					<HorizontalStack>
						<Pressable
							onPress={() => router.push("/documents")}
							className="flex-1 rounded-2xl"
							style={pressableFeedback(undefined, {
								opacity: 0.9,
							})}
						>
							<Card className="min-h-[150px]">
								<CardBody className="mt-2 gap-3">
									<View
										className="h-11 w-11 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												applyOpacity(primary, 0.12) ?? "transparent",
											borderColor: applyOpacity(primary, 0.35) ?? primary,
											borderWidth: 1,
										}}
									>
										<Ionicons
											name="document-text-outline"
											size={18}
											color={primary}
										/>
									</View>
									<View className="gap-1">
										<BodyStrong>Documents</BodyStrong>
										<Caption>Prescriptions & files</Caption>
									</View>
								</CardBody>
							</Card>
						</Pressable>

						<Pressable
							onPress={() => router.push("/documents")}
							className="flex-1 rounded-2xl"
							style={pressableFeedback(undefined, {
								opacity: 0.9,
							})}
						>
							<Card className="min-h-[150px]">
								<CardBody className="mt-2 gap-3">
									<View
										className="h-11 w-11 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												applyOpacity(primary, 0.12) ?? "transparent",
											borderColor: applyOpacity(primary, 0.35) ?? primary,
											borderWidth: 1,
										}}
									>
										<Ionicons name="camera-outline" size={18} color={primary} />
									</View>
									<View className="gap-1">
										<BodyStrong>Scan</BodyStrong>
										<Caption>Capture a prescription</Caption>
									</View>
								</CardBody>
							</Card>
						</Pressable>
					</HorizontalStack>

					<HorizontalStack>
						<Pressable
							onPress={() => {}}
							className="flex-1 rounded-2xl"
							style={pressableFeedback(undefined, {
								opacity: 0.9,
							})}
						>
							<Card className="min-h-[150px]">
								<CardBody className="mt-2 gap-3">
									<View
										className="h-11 w-11 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												applyOpacity(muted, 0.12) ?? "transparent",
											borderColor: applyOpacity(muted, 0.35) ?? muted,
											borderWidth: 1,
										}}
									>
										<Ionicons name="alarm-outline" size={18} color={muted} />
									</View>
									<View className="gap-1">
										<BodyStrong>Treatment reminders</BodyStrong>
										<Caption>Coming soon</Caption>
									</View>
								</CardBody>
							</Card>
						</Pressable>

						<Pressable
							onPress={() => router.push("/prescriptions/current")}
							className="flex-1 rounded-2xl"
							style={pressableFeedback(undefined, {
								opacity: 0.9,
							})}
						>
							<Card className="min-h-[150px]">
								<CardBody className="mt-2 gap-3">
									<View
										className="h-11 w-11 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												applyOpacity(primary, 0.12) ?? "transparent",
											borderColor: applyOpacity(primary, 0.35) ?? primary,
											borderWidth: 1,
										}}
									>
										<Ionicons name="medkit-outline" size={18} color={primary} />
									</View>
									<View className="gap-1">
										<BodyStrong>Current treatments</BodyStrong>
										<Caption>What you take today</Caption>
									</View>
								</CardBody>
							</Card>
						</Pressable>
					</HorizontalStack>
				</VerticalStack>
				<RecapBuilderModal
					open={recapOpen}
					onClose={() => setRecapOpen(false)}
					sections={RECAP_SECTIONS}
					selectedIds={recapSelectedIds}
					onSelectedIdsChange={setRecapSelectedIds}
				/>
			</Container>
		</View>
	);
}
