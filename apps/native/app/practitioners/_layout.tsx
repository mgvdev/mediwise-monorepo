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
		</Stack>
	);
}
