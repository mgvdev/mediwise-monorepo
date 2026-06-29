import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { createPrescriptionDraft } from "@/components/features/prescription/prescription-types";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

import { usePrescriptionDraft } from "./use-prescription-draft";
import { buildPrescriptionPayload } from "./utils";

type UsePrescriptionDetailFormOptions = {
	prescriptionId: string;
	onSaved?: () => void;
};

export function usePrescriptionDetailForm({
	prescriptionId,
	onSaved,
}: UsePrescriptionDetailFormOptions) {
	const { data: session } = authClient.useSession();
	const [error, setError] = useState<string | null>(null);

	const prescriptionQuery = useQuery({
		...trpc.prescriptions.get.queryOptions({
			rawId: prescriptionId,
			id: prescriptionId,
		}),
		enabled: !!session?.user && Boolean(prescriptionId),
		refetchInterval: 5000,
	});

	const draftState = usePrescriptionDraft({
		initialDraft: createPrescriptionDraft(),
		autoFill: { data: prescriptionQuery.data?.unified?.data },
	});

	const saveMutation = useMutation(
		trpc.prescriptions.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				onSaved?.();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Unable to save prescription.");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.prescriptions.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				onSaved?.();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Unable to delete prescription.");
			},
		}),
	);

	const handleSave = async () => {
		setError(null);
		if (!draftState.draft.medications.length) {
			setError("Add at least one medication.");
			return;
		}
		if (
			draftState.draft.medications.some((medication) => !medication.name.trim())
		) {
			setError("Each medication needs a name.");
			return;
		}

		try {
			const payload = buildPrescriptionPayload({
				draft: draftState.draft,
				id: prescriptionQuery.data?.unified?.id ?? null,
				rawId: prescriptionQuery.data?.raw?.id ?? null,
			});
			await saveMutation.mutateAsync(payload);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Save failed.");
		}
	};

	const raw = prescriptionQuery.data?.raw;
	const unified = prescriptionQuery.data?.unified;
	const isProcessing = raw && raw.status !== "completed" && !unified;
	const isFailed = raw?.status === "failed" && !unified;
	const documentType = unified?.data?.documentType ?? null;

	const handleDelete = async () => {
		setError(null);
		const unifiedId = unified?.id;
		if (!unifiedId) {
			setError("Nothing to delete yet.");
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: unifiedId });
		} catch (deleteError) {
			setError(
				deleteError instanceof Error ? deleteError.message : "Delete failed.",
			);
		}
	};

	return {
		session,
		error,
		setError,
		isSaving: saveMutation.isPending,
		isDeleting: deleteMutation.isPending,
		canDelete: Boolean(unified?.id),
		handleSave,
		handleDelete,
		isProcessing,
		isFailed,
		documentType,
		prescriptionQuery,
		draftState,
	};
}
