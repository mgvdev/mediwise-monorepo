import { router } from "expo-router";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { ManualPrescriptionForm } from "@/components/prescription-forms";

export default function NewPrescriptionScreen() {
	return (
		<Container className="gap-4 pt-4 pb-10">
			<View className="px-6">
				<ManualPrescriptionForm
					onSaved={(id) => {
						router.replace(`/prescriptions/${id}`);
					}}
				/>
			</View>
		</Container>
	);
}
