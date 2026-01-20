import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export default function PrescriptionsLayout() {
	const foreground = useThemeColor("foreground");

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "Manual prescription",
					headerLeft: () => (
						<Pressable
							onPress={() => router.back()}
							style={{ paddingHorizontal: 12 }}
						>
							<Ionicons name="chevron-back" size={24} color={foreground} />
						</Pressable>
					),
				}}
			/>
			<Stack.Screen
				name="index"
				title="Prescriptions"
				options={{
					headerShown: true,
					title: "Prescriptions",
					headerLeft: () => (
						<Pressable
							onPress={() => router.back()}
							style={{ paddingHorizontal: 12 }}
						>
							<Ionicons name="chevron-back" size={24} color={foreground} />
						</Pressable>
					),
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
