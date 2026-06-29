import { View } from "react-native";
import { BodyMuted, Caption, H1 } from "@/components/base/typography";
import { TabScreen } from "@/components/layout/tab-screen";

export default function AiScreen() {
	return (
		<TabScreen className="px-6">
			<View className="gap-2">
				<Caption>AI Assistant</Caption>
				<H1>Ask Mediwise</H1>
				<BodyMuted>Chat features will show up here.</BodyMuted>
			</View>
		</TabScreen>
	);
}
