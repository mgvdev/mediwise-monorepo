import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function ExamsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Exams & reports",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "New exam",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Exam",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
