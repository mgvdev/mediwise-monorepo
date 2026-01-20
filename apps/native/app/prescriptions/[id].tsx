import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { H1, Subtitle } from "@/components/base/typography";
import { PrescriptionDetailForm } from "@/components/features/prescription/prescription-forms";
import { Container } from "@/components/layout/container";
import { authClient } from "@/lib/auth-client";

export default function PrescriptionDetailScreen() {
	const { data: session } = authClient.useSession();
	const params = useLocalSearchParams<{ id: string }>();
	const id = String(params.id ?? "");

	if (!session?.user) {
		return null;
	}

	return (
		<Container className="gap-5 pt-6 pb-10">
			<View className="px-6">
				<View className="mb-4 flex-row items-center gap-3">
					<Pressable
						onPress={() => router.back()}
						className="h-10 w-10 items-center justify-center rounded-full bg-surface/60"
						accessibilityRole="button"
						accessibilityLabel="Back"
					>
						<Ionicons
							name="chevron-back"
							size={20}
							className="text-foreground"
						/>
					</Pressable>
					<View className="flex-1">
						<H1>Unified prescription</H1>
						<Subtitle>
							Review the extracted info and make any corrections.
						</Subtitle>
					</View>
				</View>
				<PrescriptionDetailForm
					prescriptionId={id}
					onSaved={() => router.back()}
				/>
			</View>
		</Container>
	);
}
