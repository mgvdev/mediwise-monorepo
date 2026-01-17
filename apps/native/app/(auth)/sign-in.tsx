import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { OtpSignIn } from "@/components/features/auth/otp-sign-in";
import { Container } from "@/components/layout/container";

export default function SignInScreen() {
	const accent = useThemeColor("primary");

	return (
		<Container className="px-6 pt-16 pb-10">
			<View className="items-center">
				<View className="h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-surface/40">
					<Ionicons name="medkit-outline" size={26} color={accent} />
				</View>
				<Text className="mt-3 font-semibold text-2xl text-foreground">
					Mediwise
				</Text>
			</View>

			<Text className="mt-6 text-muted text-sm">
				Sign in to access smart medical & e-pharma.
			</Text>

			<View className="mt-6">
				<OtpSignIn />
			</View>
		</Container>
	);
}
