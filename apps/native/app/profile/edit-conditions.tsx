import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface } from "heroui-native";
import * as React from "react";
import { View } from "react-native";
import { Caption, H1 } from "@/components/base/typography";
import { TagEditor } from "@/components/features/profile/tag-editor";
import { Container } from "@/components/layout/container";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function EditConditionsScreen() {
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

	const initial = unifiedQuery.data?.profile?.conditions ?? [];
	const [conditions, setConditions] = React.useState(initial);

	React.useEffect(() => {
		setConditions(initial);
	}, [initial]);

	if (!session?.user) return null;

	const handleSave = async () => {
		await mutation.mutateAsync({ conditions });
	};

	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="mb-6">
				<H1>Medical conditions</H1>
				<Caption className="mt-1">
					Share ongoing conditions for better guidance.
				</Caption>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<TagEditor
					label="Conditions"
					placeholder="e.g. Asthma"
					value={conditions}
					onChange={setConditions}
				/>
			</Surface>

			<Button
				className="mt-6"
				onPress={handleSave}
				isDisabled={mutation.isPending}
			>
				<Button.Label>Save conditions</Button.Label>
			</Button>
		</Container>
	);
}
