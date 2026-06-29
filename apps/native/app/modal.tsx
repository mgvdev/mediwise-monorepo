import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { BodyMuted, H3 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";

function Modal() {
	const accentForegroundColor = useThemeColor("accent-foreground");

	function handleClose() {
		router.back();
	}

	return (
		<Container>
			<View className="flex-1 items-center justify-center p-4">
				<Surface variant="secondary" className="w-full max-w-sm rounded-lg p-5">
					<View className="items-center">
						<View className="bg-accent mb-3 h-12 w-12 items-center justify-center rounded-lg">
							<Ionicons
								name="checkmark"
								size={24}
								color={accentForegroundColor}
							/>
						</View>
						<H3 className="mb-1">Modal Screen</H3>
						<BodyMuted className="mb-4 text-center">
							This is an example modal screen for dialogs and confirmations.
						</BodyMuted>
					</View>
					<Button onPress={handleClose} className="w-full" size="sm">
						<Button.Label>Close</Button.Label>
					</Button>
				</Surface>
			</View>
		</Container>
	);
}

export default Modal;
