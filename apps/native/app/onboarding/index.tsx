import { router, Stack } from "expo-router";
import { Button } from "heroui-native";
import { View } from "react-native";

import { healthCategories } from "@/app/health/health-schema";
import { Body, Caption, H1 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";

export default function OnboardingIntro() {
	const firstCategory = healthCategories[0]?.key ?? "personal_information";

	return (
		<Container className="px-6 pt-12 pb-12">
			<Stack.Screen options={{ title: "" }} />

			<View className="gap-4">
				<H1>Let’s set up your health profile</H1>
				<Body>
					We’ll ask a few quick questions across multiple categories. This helps
					personalize your experience and keeps your records accurate.
				</Body>
				<Caption>
					You can go back at any time, but you’ll need to complete all sections
					before continuing.
				</Caption>
			</View>
			<View className="mt-8">
				<Button onPress={() => router.replace(`/onboarding/${firstCategory}`)}>
					<Button.Label>Start</Button.Label>
				</Button>
			</View>
		</Container>
	);
}
