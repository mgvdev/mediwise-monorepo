import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { createPrescriptionDraft } from "@/components/prescription-types";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

import { usePrescriptionDraft } from "./use-prescription-draft";
import { usePrescriptionPhoto } from "./use-prescription-photo";
import { usePrescriptionUpload } from "./use-prescription-upload";
import { buildPrescriptionPayload } from "./utils";

const REQUIRE_PRESCRIPTION_PHOTO = false;

type UseManualPrescriptionFormOptions = {
	onSaved?: (id: string) => void;
};

export function useManualPrescriptionForm(
	options: UseManualPrescriptionFormOptions = {},
) {
	const { data: session } = authClient.useSession();
	const [rawId, setRawId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const initialDraft = useMemo(() => {
		const initial = createPrescriptionDraft();
		initial.issuedDate = new Date().toISOString().slice(0, 10);
		return initial;
	}, []);

	const draftState = usePrescriptionDraft({ initialDraft });
	const photo = usePrescriptionPhoto();
	const uploader = usePrescriptionUpload({
		intent: "manual",
		failureMessage: "Upload failed.",
	});

	const saveMutation = useMutation(
		trpc.prescriptions.save.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries();
				options.onSaved?.(data.id);
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Unable to save prescription.");
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
		if (REQUIRE_PRESCRIPTION_PHOTO && !photo.asset && !rawId) {
			setError("Add a prescription photo before saving.");
			return;
		}

		try {
			let uploadedRawId = rawId;
			if (photo.asset && !rawId) {
				const nextId = await uploader.upload(photo.asset, photo.uploadSource);
				if (!nextId) {
					setError(uploader.error ?? "Upload failed.");
					return;
				}
				setRawId(nextId);
				uploadedRawId = nextId;
			}

			const payload = buildPrescriptionPayload({
				draft: draftState.draft,
				rawId: uploadedRawId ?? null,
			});
			await saveMutation.mutateAsync(payload);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Save failed.");
		}
	};

	return {
		session,
		error,
		setError,
		isSaving: saveMutation.isPending,
		handleSave,
		photo,
		draftState,
	};
}
