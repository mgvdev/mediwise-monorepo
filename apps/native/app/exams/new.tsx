import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

import {
	ExamForm,
	type ExamFormValues,
} from "@/components/features/exam/exam-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function NewExamScreen() {
	const [error, setError] = useState<string | null>(null);
	const saveMutation = useMutation(
		trpc.exams.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Impossible d'enregistrer l'examen.");
			},
		}),
	);

	const handleSubmit = (values: ExamFormValues) => {
		setError(null);
		saveMutation.mutate(values);
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<ExamForm
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Ajouter l'examen"
				error={error}
			/>
		</Container>
	);
}
