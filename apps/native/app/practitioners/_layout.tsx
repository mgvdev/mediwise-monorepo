import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function PractitionersLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Practitioners",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "New practitioner",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Practitioner",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
