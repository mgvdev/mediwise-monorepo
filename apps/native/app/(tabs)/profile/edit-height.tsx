import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface } from "heroui-native";
import * as React from "react";
import { Text, View } from "react-native";
import { Container } from "@/components/layout/container";
import { HeightPicker } from "@/components/medical-pickers/height-picker";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

const CM_TO_IN = 0.3937008;

export default function EditHeightScreen() {
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

	const profile = unifiedQuery.data?.profile;
	const initialUnit = profile?.heightUnit ?? "cm";
	const initialCm = profile?.heightCm ?? 170;
	const initialValue =
		initialUnit === "inch" ? Math.round(initialCm * CM_TO_IN) : initialCm;

	const [unit, setUnit] = React.useState<"cm" | "inch">(initialUnit);
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setUnit(initialUnit);
		setValue(initialValue);
	}, [initialUnit, initialValue]);

	if (!session?.user) return null;

	const handleSave = async () => {
		const heightCm = unit === "inch" ? Math.round(value / CM_TO_IN) : value;
		await mutation.mutateAsync({
			heightCm,
			heightUnit: unit,
		});
	};

	return (
		<Container className="px-6 pt-12 pb-10" scroll={false}>
			<View className="mb-6">
				<Text className="font-semibold text-2xl text-foreground">
					What is your height?
				</Text>
				<Text className="mt-1 text-muted text-xs">
					We use this to tailor your health insights.
				</Text>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<HeightPicker
					value={value}
					unit={unit}
					onChange={(nextValue, nextUnit) => {
						setUnit(nextUnit);
						setValue(nextValue);
					}}
				/>
			</Surface>

			<Button
				className="mt-6"
				onPress={handleSave}
				isDisabled={mutation.isPending}
			>
				<Button.Label>Save height</Button.Label>
			</Button>
		</Container>
	);
}
