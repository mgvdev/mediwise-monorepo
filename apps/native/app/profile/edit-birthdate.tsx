import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface } from "heroui-native";
import * as React from "react";
import { View } from "react-native";
import { Caption, H1 } from "@/components/base/typography";
import { NativeDatePicker } from "@/components/features/profile/native-date-picker";
import { Container } from "@/components/layout/container";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function EditBirthdateScreen() {
	const { data: session } = authClient.useSession();
	const unifiedQuery = useQuery({
		...trpc.prescriptions.unified.get.queryOptions(),
		enabled: !!session?.user,
	});

	const mutation = useMutation(
		trpc.prescriptions.unified.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
		}),
	);

	const currentDate = unifiedQuery.data?.profile?.dateOfBirth ?? null;
	const [dateOfBirth, setDateOfBirth] = React.useState(currentDate);

	React.useEffect(() => {
		setDateOfBirth(currentDate);
	}, [currentDate]);

	if (!session?.user) return null;

	const handleSave = async () => {
		if (!dateOfBirth) return;
		await mutation.mutateAsync({ dateOfBirth });
	};

	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="mb-6">
				<H1>When were you born?</H1>
				<Caption className="mt-1">
					This helps personalize your health overview.
				</Caption>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<NativeDatePicker value={dateOfBirth} onChange={setDateOfBirth} />
			</Surface>

			<Button
				className="mt-6"
				onPress={handleSave}
				isDisabled={mutation.isPending}
			>
				<Button.Label>Save date</Button.Label>
			</Button>
		</Container>
	);
}
