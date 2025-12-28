import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { OtpSignIn } from "@/components/otp-sign-in";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const privateData = useQuery(trpc.privateData.queryOptions());
	const isConnected = healthCheck?.data === "OK";
	const isLoading = healthCheck?.isLoading;
	const { data: session } = authClient.useSession();

	const mutedColor = useThemeColor("muted");
	const successColor = useThemeColor("success");
	const dangerColor = useThemeColor("danger");

	if (!session?.user) {
		return (
			<Container className="p-6">
				<View className="mb-6 py-4">
					<Text className="mb-2 font-bold text-4xl text-foreground">
						Mediwise
					</Text>
					<Text className="text-muted text-sm">
						Invite-only access for insurer teams and pre-registered members.
					</Text>
				</View>
				<OtpSignIn />
			</Container>
		);
	}

	return (
		<Container className="p-6">
			<View className="mb-6 py-4">
				<Text className="mb-2 font-bold text-4xl text-foreground">
					Mediwise
				</Text>
			</View>

			<Card variant="secondary" className="mb-6 p-4">
				<Text className="mb-2 text-base text-foreground">
					Welcome, <Text className="font-medium">{session.user.email}</Text>
				</Text>
				<Pressable
					className="self-start rounded-lg bg-danger px-4 py-3 active:opacity-70"
					onPress={() => {
						authClient.signOut();
						queryClient.invalidateQueries();
					}}
				>
					<Text className="font-medium text-foreground">Sign Out</Text>
				</Pressable>
			</Card>

			<Card variant="secondary" className="p-6">
				<View className="mb-4 flex-row items-center justify-between">
					<Card.Title>System Status</Card.Title>
					<Chip
						variant="secondary"
						color={isConnected ? "success" : "danger"}
						size="sm"
					>
						<Chip.Label>{isConnected ? "LIVE" : "OFFLINE"}</Chip.Label>
					</Chip>
				</View>

				<Card className="p-4">
					<View className="flex-row items-center">
						<View
							className={`mr-3 h-3 w-3 rounded-full ${isConnected ? "bg-success" : "bg-muted"}`}
						/>
						<View className="flex-1">
							<Text className="mb-1 font-medium text-foreground">
								TRPC Backend
							</Text>
							<Card.Description>
								{isLoading
									? "Checking connection..."
									: isConnected
										? "Connected to API"
										: "API Disconnected"}
							</Card.Description>
						</View>
						{isLoading && (
							<Ionicons name="hourglass-outline" size={20} color={mutedColor} />
						)}
						{!isLoading && isConnected && (
							<Ionicons
								name="checkmark-circle"
								size={20}
								color={successColor}
							/>
						)}
						{!isLoading && !isConnected && (
							<Ionicons name="close-circle" size={20} color={dangerColor} />
						)}
					</View>
				</Card>
			</Card>

			<Card variant="secondary" className="mt-6 p-4">
				<Card.Title className="mb-3">Private Data</Card.Title>
				{privateData && (
					<Card.Description>{privateData.data?.message}</Card.Description>
				)}
			</Card>
		</Container>
	);
}
