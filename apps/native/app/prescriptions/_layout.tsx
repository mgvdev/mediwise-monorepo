import { Stack } from "expo-router";
import { HeaderBack } from "@/components/base/header-back-button";

export default function PrescriptionsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "Manual prescription",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Prescriptions",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="current"
				options={{
					headerShown: true,
					title: "Current treatments",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Edit prescription",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
