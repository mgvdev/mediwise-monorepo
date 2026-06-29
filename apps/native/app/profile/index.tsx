import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { LogoutButton } from "@/components/base/logout-button/logout-button";
import {
	Body,
	BodyMuted,
	BodyStrong,
	Caption,
	H2,
} from "@/components/base/typography";
import { HealthScore } from "@/components/features/health-score/health-score";
import { Container } from "@/components/layout/container";
import { Stack as VerticalStack } from "@/components/layout/stack";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function ProfileScreen() {
	const { data: session } = authClient.useSession();
	const healthQuery = useQuery({
		...trpc.healthData.get.queryOptions(),
		enabled: !!session?.user,
	});

	if (!session?.user) {
		return null;
	}

	const personalInfo =
		(healthQuery.data?.data?.personal_information as
			| Record<string, string | null>
			| undefined) ?? {};
	const firstName = personalInfo.first_name ?? "";
	const lastName = personalInfo.last_name ?? "";
	const email = session.user.email ?? "";
	const displayValue = (value: string) => (value?.trim() ? value : "—");

	return (
		<Container className="px-6 pt-6 pb-12">
			<Stack.Screen options={{ title: "Profile", headerShown: true }} />
			<View className="mb-4 gap-3">
				<H2>Profile</H2>
				<BodyMuted>Manage your Mediwise account.</BodyMuted>
			</View>

			<VerticalStack>
				<Card>
					<CardHeader>
						<CardTitle>Health score</CardTitle>
					</CardHeader>
					<CardBody className="items-center">
						<HealthScore
							score={88}
							updatedLabel="Updated today"
							summary="Your health habits are on track."
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>My information</CardTitle>
					</CardHeader>
					<CardBody className="gap-3">
						<View className="gap-1">
							<Caption>Last name</Caption>
							<BodyStrong>{displayValue(lastName)}</BodyStrong>
						</View>
						<View className="gap-1">
							<Caption>First name</Caption>
							<BodyStrong>{displayValue(firstName)}</BodyStrong>
						</View>
						<View className="gap-1">
							<Caption>Email</Caption>
							<Body>{displayValue(email)}</Body>
						</View>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<LogoutButton />
					</CardBody>
				</Card>
			</VerticalStack>
		</Container>
	);
}
