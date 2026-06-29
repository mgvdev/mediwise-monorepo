import { useQuery } from "@tanstack/react-query";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { Spinner } from "heroui-native";
import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import { View } from "react-native";

import { Caption } from "@/components/base/typography";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export function AuthGate({ children }: PropsWithChildren) {
	const { data: session, isPending } = authClient.useSession();
	const segments = useSegments();
	const router = useRouter();
	const rootNavigationState = useRootNavigationState();
	const inAuthGroup = segments[0] === "(auth)";
	const inOnboardingGroup = segments[0] === "onboarding";
	const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "1";
	const lastRedirectRef = useRef<string | null>(null);
	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
		enabled: !!session?.user,
	});
	const onboardingStatus = healthQuery.data;
	const hasCompletedOnboarding = !!onboardingStatus?.onboardedAt;
	const onboardingTarget = onboardingStatus?.onboarding?.currentCategoryKey
		? `/onboarding/${onboardingStatus.onboarding.currentCategoryKey}`
		: "/onboarding";

	useEffect(() => {
		if (isStorybookEnabled) return;
		if (!rootNavigationState?.key) return;
		if (isPending) return;
		if (!session?.user && !inAuthGroup) {
			if (lastRedirectRef.current !== "/sign-in") {
				lastRedirectRef.current = "/sign-in";
				router.replace("/sign-in");
			}
			return;
		}
		if (session?.user && healthQuery.isPending) {
			return;
		}
		if (session?.user && !hasCompletedOnboarding) {
			if (!inOnboardingGroup) {
				if (lastRedirectRef.current !== onboardingTarget) {
					lastRedirectRef.current = onboardingTarget;
					router.replace(onboardingTarget);
				}
				return;
			}
			return;
		}
		if (session?.user && inOnboardingGroup && hasCompletedOnboarding) {
			if (lastRedirectRef.current !== "/") {
				lastRedirectRef.current = "/";
				router.replace("/");
			}
			return;
		}
		if (session?.user && inAuthGroup) {
			if (lastRedirectRef.current !== "/") {
				lastRedirectRef.current = "/";
				router.replace("/");
			}
		}
	}, [
		inAuthGroup,
		inOnboardingGroup,
		isPending,
		isStorybookEnabled,
		healthQuery.isPending,
		hasCompletedOnboarding,
		onboardingTarget,
		rootNavigationState?.key,
		router,
		session?.user,
	]);

	if (isStorybookEnabled) {
		return children;
	}

	if ((isPending || (session?.user && healthQuery.isPending)) && !inAuthGroup) {
		return (
			<View className="bg-background flex-1 items-center justify-center px-6">
				<Spinner size="lg" color="default" />
				<Caption className="mt-3">Checking your session...</Caption>
			</View>
		);
	}

	if (!session?.user && !inAuthGroup) {
		return null;
	}

	return children;
}
