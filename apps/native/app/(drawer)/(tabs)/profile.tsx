import { Button, Surface } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { OtpSignIn } from "@/components/otp-sign-in";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export default function ProfileScreen() {
	const { data: session } = authClient.useSession();

	if (!session?.user) {
		return (
			<Container className="p-6">
				<View className="mb-6 py-4">
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Profile
					</Text>
					<Text className="text-muted text-sm">
						Sign in to view your account details.
					</Text>
				</View>
				<OtpSignIn />
			</Container>
		);
	}

	return (
		<Container className="p-6">
			<View className="mb-6 py-4">
				<Text className="mb-2 font-bold text-3xl text-foreground">Profile</Text>
				<Text className="text-muted text-sm">
					Manage your Mediwise account.
				</Text>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-5">
				<Text className="mb-2 text-muted text-xs uppercase tracking-widest">
					Signed in email
				</Text>
				<Text className="font-semibold text-base text-foreground">
					{session.user.email}
				</Text>
			</Surface>

			<View className="mt-4">
				<Button
					variant="secondary"
					onPress={() => {
						authClient.signOut();
						queryClient.invalidateQueries();
					}}
				>
					<Button.Label>Sign out</Button.Label>
				</Button>
			</View>
		</Container>
	);
}
