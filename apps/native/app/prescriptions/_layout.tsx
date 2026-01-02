import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export default function PrescriptionsLayout() {
	const background = useThemeColor("background");
	const foreground = useThemeColor("foreground");

	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: background },
				headerTintColor: foreground,
				headerTitleStyle: { color: foreground, fontWeight: "600" },
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen
				name="index"
				options={{
					title: "Prescriptions",
					headerLeft: () => (
						<Pressable onPress={() => router.back()}>
							<Ionicons name="chevron-back" size={22} color={foreground} />
						</Pressable>
					),
				}}
			/>
			<Stack.Screen name="[id]" options={{ title: "Prescription" }} />
		</Stack>
	);
}
