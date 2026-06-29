import { router } from "expo-router";
import { HeaderBackButton } from "expo-router/react-navigation";
import { useThemeColor } from "heroui-native";

type HeaderBackProps = {
	onPress?: () => void;
};

export function HeaderBack({ onPress }: HeaderBackProps) {
	const foreground = useThemeColor("foreground");

	return (
		<HeaderBackButton
			tintColor={foreground}
			onPress={onPress ?? (() => router.back())}
		/>
	);
}
