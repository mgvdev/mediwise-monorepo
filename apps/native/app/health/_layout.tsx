import { HeaderBackButton } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function HealthLayout() {
	const foreground = useThemeColor("foreground");

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				// headerBackTitleVisible: false,
				headerBackTitle: "",
				headerLeft: (props) => (
					<HeaderBackButton
						{...props}
						tintColor={foreground}
						onPress={() => router.back()}
					/>
				),
			}}
		/>
	);
}
