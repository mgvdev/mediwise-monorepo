import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface, TextField } from "heroui-native";
import * as React from "react";
import { View } from "react-native";
import { Caption, H1 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function EditNotesScreen() {
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

	const initial = unifiedQuery.data?.profile?.notes ?? "";
	const [notes, setNotes] = React.useState(initial);

	React.useEffect(() => {
		setNotes(initial);
	}, [initial]);

	if (!session?.user) return null;

	const handleSave = async () => {
		await mutation.mutateAsync({ notes });
	};

	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="mb-6">
				<H1>Additional notes</H1>
				<Caption className="mt-1">
					Share anything else that feels relevant.
				</Caption>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<TextField>
					<TextField.Label>Notes</TextField.Label>
					<TextField.Input
						value={notes}
						onChangeText={setNotes}
						multiline
						placeholder="Add any extra details..."
						className="min-h-[120px]"
					/>
				</TextField>
			</Surface>

			<Button
				className="mt-6"
				onPress={handleSave}
				isDisabled={mutation.isPending}
			>
				<Button.Label>Save notes</Button.Label>
			</Button>
		</Container>
	);
}
