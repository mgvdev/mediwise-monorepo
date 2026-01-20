import { Text, View } from "react-native";

import { Container } from "@/components/layout/container";

export default function AiScreen() {
	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="gap-2">
				<Text className="text-muted text-xs">AI Assistant</Text>
				<Text className="font-semibold text-2xl text-foreground">
					Ask Mediwise
				</Text>
				<Text className="text-muted text-sm">
					Chat features will show up here.
				</Text>
			</View>
		</Container>
	);
}
