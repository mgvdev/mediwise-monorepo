import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

function DrawerLayout() {
	const themeColorBackground = useThemeColor("background");

	return (
		<Drawer
			screenOptions={{
				drawerStyle: { backgroundColor: themeColorBackground },
				headerShown: false,
				swipeEnabled: false,
			}}
		>
			<Drawer.Screen
				name="(tabs)"
				options={{
					title: "Mediwise",
				}}
			/>
		</Drawer>
	);
}

export default DrawerLayout;
