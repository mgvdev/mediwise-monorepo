import { router } from "expo-router";
import { View } from "react-native";
import { ManualPrescriptionForm } from "@/components/features/prescription/prescription-forms";
import { Container } from "@/components/layout/container";

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
