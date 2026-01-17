import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Card, Chip, Surface, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { Container } from "@/components/layout/container";
import { applyOpacity } from "@/components/utils";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const _privateData = useQuery(trpc.privateData.queryOptions());
	const _isConnected = healthCheck?.data === "OK";
	const _isLoading = healthCheck?.isLoading;
	const { data: session } = authClient.useSession();
	const prescriptions = useQuery({
		...trpc.prescriptions.list.queryOptions(),
		enabled: !!session?.user,
	});

	const _successColor = useThemeColor("success");
	const _dangerColor = useThemeColor("danger");
	const primaryColor = useThemeColor("primary");

	if (!session?.user) {
		return null;
	}

	const prescriptionItems = prescriptions.data ?? [];
	const processedCount =
		prescriptionItems.filter((item) => item.status === "completed").length ?? 0;
	const pendingCount = prescriptionItems.length - processedCount;
	const _recentPrescriptions = [...prescriptionItems]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 3);

	return (
		<Container className="gap-6 px-6 pt-14 pb-10">
			<View className="flex-row items-start justify-between">
				<View>
					<Text className="text-muted text-sm">Welcome back</Text>
					<Text className="mt-1 font-semibold text-2xl text-foreground">
						{session.user.email}
					</Text>
				</View>
				<Pressable
					className="rounded-full border border-border/60 px-3 py-2"
					onPress={() => {
						authClient.signOut();
						queryClient.invalidateQueries();
					}}
				>
					<Text className="font-semibold text-foreground text-xs">
						Sign out
					</Text>
				</Pressable>
			</View>

			<Surface variant="secondary" className="rounded-3xl p-5">
				<View className="flex-row items-center justify-between">
					<View>
						<Text className="text-muted text-xs">Today</Text>
						<Text className="mt-1 font-semibold text-foreground text-xl">
							Track your prescriptions in one place
						</Text>
					</View>
					<View
						className="h-12 w-12 items-center justify-center rounded-full"
						style={{
							backgroundColor:
								applyOpacity(primaryColor, 0.15) ?? "transparent",
							borderColor: applyOpacity(primaryColor, 0.35) ?? primaryColor,
							borderWidth: 1,
						}}
					>
						<Ionicons name="heart-outline" size={20} color={primaryColor} />
					</View>
				</View>
				<View className="mt-4 flex-row gap-2">
					<Button onPress={() => router.push("/documents")} className="flex-1">
						<Button.Label>Upload</Button.Label>
					</Button>
					<Button
						variant="secondary"
						onPress={() => router.push("/prescriptions/new")}
						className="flex-1"
					>
						<Button.Label>Manual entry</Button.Label>
					</Button>
				</View>
			</Surface>

			<View className="gap-3">
				<Text className="font-semibold text-foreground text-sm">
					Quick actions
				</Text>
				<View className="flex-row gap-3">
					<Surface variant="secondary" className="flex-1 rounded-2xl p-4">
						<View
							className="mb-3 h-10 w-10 items-center justify-center rounded-full"
							style={{
								backgroundColor:
									applyOpacity(primaryColor, 0.14) ?? "transparent",
							}}
						>
							<Ionicons name="scan-outline" size={18} color={primaryColor} />
						</View>
						<Text className="font-semibold text-foreground text-sm">
							Scan prescription
						</Text>
						<Text className="mt-1 text-muted text-xs">
							Capture and auto-extract details.
						</Text>
						<Button
							variant="ghost"
							onPress={() => router.push("/documents")}
							className="mt-3"
						>
							<Button.Label>Start scan</Button.Label>
						</Button>
					</Surface>

					<Surface variant="secondary" className="flex-1 rounded-2xl p-4">
						<View
							className="mb-3 h-10 w-10 items-center justify-center rounded-full"
							style={{
								backgroundColor:
									applyOpacity(primaryColor, 0.14) ?? "transparent",
							}}
						>
							<Ionicons
								name="chatbubble-ellipses-outline"
								size={18}
								color={primaryColor}
							/>
						</View>
						<Text className="font-semibold text-foreground text-sm">
							Ask the AI
						</Text>
						<Text className="mt-1 text-muted text-xs">
							Get quick answers about your care.
						</Text>
						<Button
							variant="ghost"
							onPress={() => router.push("/ai")}
							className="mt-3"
						>
							<Button.Label>Open chat</Button.Label>
						</Button>
					</Surface>
				</View>
			</View>

			<Card variant="secondary" className="p-5">
				<View className="mb-4 flex-row items-center justify-between">
					<Card.Title>Prescription overview</Card.Title>
					<Chip variant="secondary" color="primary" size="sm">
						<Chip.Label>{prescriptionItems.length} total</Chip.Label>
					</Chip>
				</View>
				<View className="flex-row items-center gap-4">
					<View className="flex-1">
						<Text className="font-semibold text-2xl text-foreground">
							{processedCount}
						</Text>
						<Text className="text-muted text-xs">Processed</Text>
					</View>
					<View className="h-8 w-px bg-border/60" />
					<View className="flex-1">
						<Text className="font-semibold text-2xl text-foreground">
							{pendingCount}
						</Text>
						<Text className="text-muted text-xs">Pending</Text>
					</View>
				</View>
				<Button
					variant="secondary"
					onPress={() => router.push("/prescriptions")}
					className="mt-4"
				>
					<Button.Label>View all prescriptions</Button.Label>
				</Button>
			</Card>
		</Container>
	);
}
