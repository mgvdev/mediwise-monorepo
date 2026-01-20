import { View } from "react-native";
import { BodyMuted, Caption, H1 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";

export default function AiScreen() {
	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="gap-2">
				<Caption>AI Assistant</Caption>
				<H1>Ask Mediwise</H1>
				<BodyMuted>Chat features will show up here.</BodyMuted>
			</View>
		</Container>
	);
}
