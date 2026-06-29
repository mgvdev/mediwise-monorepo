import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";

import { BodyMuted, H1 } from "@/components/base/typography";
import { OtpSignIn } from "@/components/features/auth/otp-sign-in";
import { Container } from "@/components/layout/container";

export default function SignInScreen() {
	const accent = useThemeColor("accent");

	return (
		<Container className="px-6 pt-16 pb-10">
			<View className="items-center">
				<View className="border-border/60 bg-surface/40 h-14 w-14 items-center justify-center rounded-full border">
					<Ionicons name="medkit-outline" size={26} color={accent} />
				</View>
				<H1 className="mt-3">Mediwise</H1>
			</View>

			<BodyMuted className="mt-6">
				Sign in to access smart medical & e-pharma.
			</BodyMuted>

			<View className="mt-6">
				<OtpSignIn />
			</View>
		</Container>
	);
}
