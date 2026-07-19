import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function CalendarLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Appointments",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "New appointment",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Appointment",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
