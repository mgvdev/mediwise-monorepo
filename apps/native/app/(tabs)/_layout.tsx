import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const themeColorMuted = useThemeColor("muted");
	const themeColorPrimary = useThemeColor("primary");
	const allowedTabs = new Set(["index", "ai", "documents"]);

	return (
		<Tabs
			screenOptions={({ route }) => ({
				headerShown: false,
				headerStyle: {
					backgroundColor: themeColorBackground,
				},
				headerTintColor: themeColorForeground,
				headerTitleStyle: {
					color: themeColorForeground,
					fontWeight: "600",
				},
				tabBarActiveTintColor: themeColorPrimary,
				tabBarInactiveTintColor: themeColorMuted,
				tabBarStyle: {
					backgroundColor: themeColorBackground,
				},
				tabBarButton: allowedTabs.has(route.name) ? undefined : () => null,
				tabBarItemStyle: allowedTabs.has(route.name)
					? undefined
					: { display: "none" },
			})}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="ai"
				options={{
					title: "AI Assistant",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="chatbubble-ellipses" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="documents"
				options={{
					title: "Documents",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="document-text" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
