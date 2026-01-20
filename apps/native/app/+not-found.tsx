import { Link, Stack } from "expo-router";
import { Button, Surface } from "heroui-native";
import { View } from "react-native";
import { BodyMuted, Emoji, H3 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Not Found" }} />
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Surface
						variant="secondary"
						className="max-w-sm items-center rounded-lg p-6"
					>
						<Emoji className="mb-3">🤔</Emoji>
						<H3 className="mb-1">Page Not Found</H3>
						<BodyMuted className="mb-4 text-center">
							The page you're looking for doesn't exist.
						</BodyMuted>
						<Link href="/" asChild>
							<Button size="sm">Go Home</Button>
						</Link>
					</Surface>
				</View>
			</Container>
		</>
	);
}
