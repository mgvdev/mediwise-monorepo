import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function RemindersLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Treatment reminders",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[med]"
				options={{
					headerShown: true,
					title: "Reminder",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="settings"
				options={{
					headerShown: true,
					title: "Reminder times",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
