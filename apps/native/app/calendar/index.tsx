import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";

import { BodyMuted, H2 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";

export default function CalendarScreen() {
	const accent = useThemeColor("accent");
	return (
		<Container className="px-6 pt-10" scroll={false}>
			<View className="flex-1 items-center justify-center gap-3">
				<Ionicons name="calendar-outline" size={40} color={accent} />
				<H2 className="text-center">Calendar</H2>
				<BodyMuted className="text-center">
					Your appointments and health events. Coming soon.
				</BodyMuted>
			</View>
		</Container>
	);
}
