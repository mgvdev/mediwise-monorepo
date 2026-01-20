import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Surface } from "heroui-native";
import * as React from "react";
import { View } from "react-native";
import { Caption, H1 } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { WeightPicker } from "@/components/medical-pickers/weight-picker";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

const KG_TO_LBS = 2.20462;

export default function EditWeightScreen() {
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
	const initialUnit = profile?.weightUnit ?? "kg";
	const initialKg = profile?.weightKg ?? 68;
	const initialValue =
		initialUnit === "lbs" ? Math.round(initialKg * KG_TO_LBS) : initialKg;

	const [unit, setUnit] = React.useState<"kg" | "lbs">(initialUnit);
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setUnit(initialUnit);
		setValue(initialValue);
	}, [initialUnit, initialValue]);

	if (!session?.user) return null;

	const handleSave = async () => {
		const weightKg = unit === "lbs" ? Math.round(value / KG_TO_LBS) : value;
		await mutation.mutateAsync({
			weightKg,
			weightUnit: unit,
		});
	};

	return (
		<Container className="px-6 pt-12 pb-10">
			<View className="mb-6">
				<H1>What is your weight?</H1>
				<Caption className="mt-1">
					We use this to personalize your care plan.
				</Caption>
			</View>

			<Surface variant="secondary" className="rounded-2xl p-4">
				<WeightPicker
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
				<Button.Label>Save weight</Button.Label>
			</Button>
		</Container>
	);
}
