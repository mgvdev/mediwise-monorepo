import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface } from "heroui-native";
import { View } from "react-native";
import {
	BodyMuted,
	Caption,
	Display,
	Overline,
	Title,
} from "@/components/base/typography";
import { ProfileActionRow } from "@/components/features/profile/profile-action-row";
import { Container } from "@/components/layout/container";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function ProfileScreen() {
	const { data: session } = authClient.useSession();
	const unifiedQuery = useQuery({
		...trpc.prescriptions.unified.get.queryOptions(),
		enabled: !!session?.user,
	});

	if (!session?.user) {
		return null;
	}

	const profile = unifiedQuery.data?.profile;
	const dateOfBirth = profile?.dateOfBirth
		? new Date(profile.dateOfBirth).toLocaleDateString()
		: null;
	const heightValue =
		typeof profile?.heightCm === "number"
			? profile.heightUnit === "inch"
				? `${Math.round(profile.heightCm / 2.54)} in`
				: `${profile.heightCm} cm`
			: null;
	const weightValue =
		typeof profile?.weightKg === "number"
			? profile.weightUnit === "lbs"
				? `${Math.round(profile.weightKg * 2.20462)} lbs`
				: `${profile.weightKg} kg`
			: null;
	const allergiesValue = profile?.allergies?.length
		? profile.allergies.join(", ")
		: null;
	const lifelongValue = profile?.lifelongTreatments?.length
		? profile.lifelongTreatments.join(", ")
		: null;
	const conditionsValue = profile?.conditions?.length
		? profile.conditions.join(", ")
		: null;
	const notesValue = profile?.notes?.trim() ? profile.notes : null;

	return (
		<Container className="p-6">
			<View className="mb-6 py-4">
				<Display className="mb-2">Profile</Display>
				<BodyMuted>Manage your Mediwise account.</BodyMuted>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-5">
				<Overline className="mb-2 tracking-widest">Signed in email</Overline>
				<Title>{session.user.email}</Title>
			</Surface>

			<Surface variant="secondary" className="mt-4 rounded-2xl p-5">
				<View className="mb-3">
					<Title>Health information</Title>
					<Caption>Keep your medical profile up to date.</Caption>
				</View>
				<View className="gap-3">
					<ProfileActionRow
						label="Date of birth"
						value={dateOfBirth}
						onPress={() => router.push("/profile/edit-birthdate")}
					/>
					<ProfileActionRow
						label="Height"
						value={heightValue}
						onPress={() => router.push("/profile/edit-height")}
					/>
					<ProfileActionRow
						label="Weight"
						value={weightValue}
						onPress={() => router.push("/profile/edit-weight")}
					/>
					<ProfileActionRow
						label="Allergies"
						value={allergiesValue}
						onPress={() => router.push("/profile/edit-allergies")}
					/>
					<ProfileActionRow
						label="Lifelong treatments"
						value={lifelongValue}
						onPress={() => router.push("/profile/edit-lifelong")}
					/>
					<ProfileActionRow
						label="Medical conditions"
						value={conditionsValue}
						onPress={() => router.push("/profile/edit-conditions")}
					/>
					<ProfileActionRow
						label="Additional notes"
						value={notesValue}
						onPress={() => router.push("/profile/edit-notes")}
					/>
				</View>
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
