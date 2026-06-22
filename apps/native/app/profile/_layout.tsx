import { Stack } from "expo-router";
import { HeaderBack } from "@/components/base/header-back-button";

export default function ProfileLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerLeft: () => <HeaderBack />,
			}}
		/>
	);
}
