import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

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
		<Container className="gap-4 pt-4 pb-10">
			<View className="px-6">
				<PrescriptionDetailForm
					prescriptionId={id}
					onSaved={() => router.back()}
				/>
			</View>
		</Container>
	);
}
