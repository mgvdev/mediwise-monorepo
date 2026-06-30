import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function ExamsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Examens & comptes rendus",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "Nouvel examen",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Examen",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
