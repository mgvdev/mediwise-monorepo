import { Stack } from "expo-router";
import { HeaderBack } from "@/components/base/header-back-button";

export default function HealthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				// headerBackTitleVisible: false,
				headerBackTitle: "",
				headerLeft: () => <HeaderBack />,
			}}
		/>
	);
}
