import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useState } from "react";
import { Alert, View } from "react-native";

import { BodyStrong } from "@/components/base/typography";
import {
	AppointmentForm,
	type AppointmentFormValues,
} from "@/components/features/appointment/appointment-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function AppointmentDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = params.id;
	const [error, setError] = useState<string | null>(null);

	const appointmentQuery = useQuery({
		...trpc.appointments.get.queryOptions({ id }),
		enabled: Boolean(id),
	});

	const saveMutation = useMutation(
		trpc.appointments.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the appointment.");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.appointments.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't delete the appointment.");
			},
		}),
	);

	const appointment = appointmentQuery.data;

	const handleSubmit = (values: AppointmentFormValues) => {
		setError(null);
		saveMutation.mutate({ ...values, id });
	};

	const handleDelete = () => {
		Alert.alert("Delete appointment", "This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => deleteMutation.mutate({ id }),
			},
		]);
	};

	if (appointmentQuery.isPending) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center">
					<Spinner />
				</View>
			</Container>
		);
	}

	if (!appointment) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center gap-2">
					<BodyStrong>Appointment not found</BodyStrong>
				</View>
			</Container>
		);
	}

	return (
		<Container className="px-6 pt-4 pb-12">
			<AppointmentForm
				initial={{
					practitionerId: appointment.practitionerId,
					startAt: new Date(appointment.startAt).toISOString(),
					reason: appointment.reason,
					location: appointment.location,
					notes: appointment.notes,
					reminderOffsetMinutes: appointment.reminderOffsetMinutes,
				}}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Save changes"
				error={error}
				onDelete={handleDelete}
				isDeleting={deleteMutation.isPending}
			/>
		</Container>
	);
}
