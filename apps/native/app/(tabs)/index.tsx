import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SoftHealthBackground } from "@/components/base/backgrounds";
import { Caption, Display } from "@/components/base/typography";
import { FlowerBackground, FlowerNav } from "@/components/features/flower-nav";
import { authClient } from "@/lib/auth-client";

// Matches the floating native tab bar height so the flower clears it.
const FLOATING_TAB_BAR_HEIGHT = 88;

function formatToday() {
	return new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

export default function Home() {
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const flowerSize = Math.min(width - 24, 380);

	const { data: session } = authClient.useSession();
	const firstName = session?.user?.name?.trim().split(/\s+/)[0];
	const greeting = firstName ? `Hello, ${firstName}` : "Hello";

	return (
		<View className="bg-background flex-1">
			<SoftHealthBackground heightRatio={1} />
			<FlowerBackground />
			<View
				className="flex-1 px-6"
				style={{
					paddingTop: insets.top,
					paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT,
				}}
			>
				<View className="items-center pt-4">
					<Caption className="text-muted">{formatToday()}</Caption>
					<Display className="text-foreground mt-1 text-center">
						{greeting}
					</Display>
				</View>

				<View className="flex-1 items-center justify-center">
					<FlowerNav size={flowerSize} />
				</View>
			</View>
		</View>
	);
}
