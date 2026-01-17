import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { Spinner } from "heroui-native";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export function AuthGate({ children }: PropsWithChildren) {
	const { data: session, isPending } = authClient.useSession();
	const segments = useSegments();
	const router = useRouter();
	const rootNavigationState = useRootNavigationState();
	const inAuthGroup = segments[0] === "(auth)";
	const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "1";

	useEffect(() => {
		if (isStorybookEnabled) return;
		if (!rootNavigationState?.key) return;
		if (isPending) return;
		if (!session?.user && !inAuthGroup) {
			router.replace("/sign-in");
			return;
		}
		if (session?.user && inAuthGroup) {
			router.replace("/");
		}
	}, [
		inAuthGroup,
		isPending,
		isStorybookEnabled,
		rootNavigationState?.key,
		router,
		session?.user,
	]);

	if (isStorybookEnabled) {
		return children;
	}

	if (isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Spinner size="lg" color="default" />
				<Text className="mt-3 text-muted text-xs">
					Checking your session...
				</Text>
			</View>
		);
	}

	if (!session?.user && !inAuthGroup) {
		return null;
	}

	return children;
}
