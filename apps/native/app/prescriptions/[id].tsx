import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { OtpSignIn } from "@/components/otp-sign-in";
import { PrescriptionDetailForm } from "@/components/prescription-forms";
import { authClient } from "@/lib/auth-client";

export default function PrescriptionDetailScreen() {
	const { data: session } = authClient.useSession();
	const params = useLocalSearchParams<{ id: string }>();
	const id = String(params.id ?? "");

	if (!session?.user) {
		return (
			<Container className="p-6">
				<View className="mb-6 py-4">
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Prescriptions
					</Text>
					<Text className="text-muted text-sm">
						Sign in to manage prescriptions.
					</Text>
				</View>
				<OtpSignIn />
			</Container>
		);
	}

	return (
		<Container className="gap-5 pt-4 pb-10">
			<View className="px-6">
				<PrescriptionDetailForm
					prescriptionId={id}
					onSaved={() => router.back()}
				/>
			</View>
		</Container>
	);
}
