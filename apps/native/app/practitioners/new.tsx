import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
	PractitionerForm,
	type PractitionerFormValues,
} from "@/components/features/practitioner/practitioner-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function NewPractitionerScreen() {
	// Prefilled when the user taps a suggestion found in their documents.
	const params = useLocalSearchParams<{ name?: string }>();
	const suggestedName = params.name ? decodeURIComponent(params.name) : "";
	const [error, setError] = useState<string | null>(null);

	const saveMutation = useMutation(
		trpc.practitioners.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the practitioner.");
			},
		}),
	);

	const handleSubmit = (values: PractitionerFormValues) => {
		setError(null);
		saveMutation.mutate({
			...values,
			source: suggestedName ? "document" : "manual",
		});
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<PractitionerForm
				initial={splitSuggestedName(suggestedName)}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Add practitioner"
				error={error}
			/>
		</Container>
	);
}

/**
 * Documents give one full name ("Dr. Jane Doe"): drop the title, use the last
 * word as the last name and whatever precedes it as the first name.
 */
function splitSuggestedName(raw: string) {
	const cleaned = raw
		.replace(/^(dr|doctor|pr|prof|professor)\.?\s+/i, "")
		.trim();
	if (!cleaned) return undefined;
	const parts = cleaned.split(/\s+/);
	const lastName = parts.pop() ?? cleaned;
	return {
		firstName: parts.join(" ") || null,
		lastName,
	};
}
