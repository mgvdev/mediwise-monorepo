import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppHeader } from "@/components/base/app-header";
import {
	Card,
	CardAction,
	CardBody,
	CardHeader,
	CardTitle,
} from "@/components/base/card";
import { BodyMuted, BodyStrong, Caption } from "@/components/base/typography";
import {
	RecapBuilderModal,
	type RecapSection,
} from "@/components/features/recap/recap-builder-button";
import { HorizontalStack, VerticalStack } from "@/components/layout/stack";
import { TabScreen } from "@/components/layout/tab-screen";
import { applyOpacity, pressableFeedback } from "@/components/utils";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

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

type FieldValue = string | string[] | null | undefined;
type HealthDataMap = Record<string, Record<string, FieldValue> | undefined>;

const CONDITION_CATEGORIES = [
	"cardiology",
	"pulmonology",
	"neurology",
	"endocrinology",
	"psychiatry",
] as const;

const asString = (value: FieldValue) =>
	typeof value === "string" && value.trim() ? value.trim() : null;

function getAge(birthISO: FieldValue) {
	const iso = asString(birthISO);
	if (!iso) return null;
	const birth = new Date(iso);
	if (Number.isNaN(birth.getTime())) return null;
	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();
	const monthDiff = now.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age >= 0 ? age : null;
}

function buildMedicalPreview(data: HealthDataMap) {
	const personal = data.personal_information ?? {};
	const allergies = data.allergies ?? {};

	const fullName =
		[asString(personal.first_name), asString(personal.last_name)]
			.filter(Boolean)
			.join(" ") || null;

	const age = getAge(personal.birth_date);
	const sex = asString(personal.biological_sex);
	const ageSex = [age != null ? `${age} yrs` : null, sex]
		.filter(Boolean)
		.join(" · ");

	let conditionCount = 0;
	for (const key of CONDITION_CATEGORIES) {
		for (const value of Object.values(data[key] ?? {})) {
			if (value === "yes") conditionCount += 1;
		}
	}

	const allergyList = Array.isArray(allergies.details)
		? allergies.details.filter(Boolean)
		: [];

	return { fullName, ageSex, conditionCount, allergyCount: allergyList.length };
}

export default function Home() {
	const primary = useThemeColor("accent");
	const muted = useThemeColor("muted");
	const [recapOpen, setRecapOpen] = useState(false);
	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
	});
	const viewerQuery = useQuery({
		...trpc.viewer.me.queryOptions(),
	});
	const { data: session } = authClient.useSession();
	const firstName = session?.user?.name?.trim().split(/\s+/)[0];
	const greeting = firstName ? `Hi, ${firstName}` : "Hi";
	const preview = buildMedicalPreview(healthQuery.data?.data ?? {});
	const [recapSelectedIds, setRecapSelectedIds] = useState(
		RECAP_SECTIONS.map((section) => section.id),
	);

	return (
		<TabScreen className="px-6">
			<AppHeader
				title={greeting}
				subtitle="Your health summary"
				insurerName={viewerQuery.data?.tenant?.name}
				insurerLogoUrl={viewerQuery.data?.tenant?.logoUrl}
				notificationCount={3}
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
							{preview.fullName ? (
								<>
									<BodyStrong>{preview.fullName}</BodyStrong>
									{preview.ageSex ? <Caption>{preview.ageSex}</Caption> : null}
									<HorizontalStack className="mt-1 gap-4">
										<View className="gap-0.5">
											<Caption>Conditions</Caption>
											<BodyStrong>
												{preview.conditionCount > 0
													? preview.conditionCount
													: "None"}
											</BodyStrong>
										</View>
										<View className="gap-0.5">
											<Caption>Allergies</Caption>
											<BodyStrong>
												{preview.allergyCount > 0
													? preview.allergyCount
													: "None"}
											</BodyStrong>
										</View>
									</HorizontalStack>
								</>
							) : (
								<>
									<BodyStrong>All your health info, simplified.</BodyStrong>
									<BodyMuted>
										Readable summary of allergies, conditions, and treatments.
									</BodyMuted>
								</>
							)}
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
										backgroundColor: applyOpacity(muted, 0.12) ?? "transparent",
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
		</TabScreen>
	);
}
