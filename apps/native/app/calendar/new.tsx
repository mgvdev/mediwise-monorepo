import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
	AppointmentForm,
	type AppointmentFormValues,
} from "@/components/features/appointment/appointment-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function NewAppointmentScreen() {
	// Prefilled when coming from a practitioner's detail screen.
	const params = useLocalSearchParams<{ practitionerId?: string }>();
	const [error, setError] = useState<string | null>(null);

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

	const handleSubmit = (values: AppointmentFormValues) => {
		setError(null);
		saveMutation.mutate(values);
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<AppointmentForm
				initial={{ practitionerId: params.practitionerId ?? null }}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Add appointment"
				error={error}
			/>
		</Container>
	);
}
