import { useEffect, useRef, useState } from "react";

import {
	createMedicationDraft,
	createPrescriptionDraft,
	type MedicationDraft,
	type PrescriptionDraft,
} from "@/components/prescription-types";

import { computeValidUntil, mapUnifiedToDraft } from "./utils";

type UnifiedPrescriptionData = Parameters<typeof mapUnifiedToDraft>[0];

type AutoFill = {
	data?: UnifiedPrescriptionData | null;
	enabled?: boolean;
};

type UsePrescriptionDraftOptions = {
	initialDraft?: PrescriptionDraft;
	autoFill?: AutoFill;
	enableAutoValidUntil?: boolean;
	trackUserEdits?: boolean;
};

export function usePrescriptionDraft(
	options: UsePrescriptionDraftOptions = {},
) {
	const {
		initialDraft,
		autoFill,
		enableAutoValidUntil = true,
		trackUserEdits = true,
	} = options;

	const [draft, setDraft] = useState<PrescriptionDraft>(() => {
		return initialDraft ?? createPrescriptionDraft();
	});
	const [editorValue, setEditorValue] = useState<MedicationDraft | null>(null);
	const [editorIndex, setEditorIndex] = useState<number | null>(null);
	const [validUntilLocked, setValidUntilLocked] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const [hasUserEdits, setHasUserEdits] = useState(false);
	const autoUpdateRef = useRef(false);

	useEffect(() => {
		const autoFillEnabled = autoFill?.enabled ?? true;
		if (!autoFillEnabled) return;
		if (!autoFill?.data || hasInitialized || hasUserEdits) return;
		const mapped = mapUnifiedToDraft(autoFill.data);
		setDraft((previous) => ({
			...previous,
			...mapped,
		}));
		setHasInitialized(true);
	}, [autoFill?.data, autoFill?.enabled, hasInitialized, hasUserEdits]);

	useEffect(() => {
		if (!enableAutoValidUntil) return;
		if (validUntilLocked) return;
		const nextValidUntil = computeValidUntil(
			draft.issuedDate,
			draft.medications,
		);
		if (!nextValidUntil || nextValidUntil === draft.validUntil) return;
		autoUpdateRef.current = true;
		setDraft((previous) => ({ ...previous, validUntil: nextValidUntil }));
		autoUpdateRef.current = false;
	}, [
		draft.issuedDate,
		draft.medications,
		draft.validUntil,
		enableAutoValidUntil,
		validUntilLocked,
	]);

	const handleDraftChange = (next: PrescriptionDraft) => {
		if (!autoUpdateRef.current && next.validUntil !== draft.validUntil) {
			setValidUntilLocked(next.validUntil.trim().length > 0);
		}
		if (trackUserEdits) {
			setHasUserEdits(true);
		}
		setDraft(next);
	};

	const handleAddMedication = () => {
		const next = createMedicationDraft();
		setEditorValue(next);
		setEditorIndex(draft.medications.length);
	};

	const handleEditMedication = (index: number) => {
		setEditorValue(draft.medications[index]);
		setEditorIndex(index);
	};

	const handleSaveMedication = () => {
		if (!editorValue || editorIndex === null) return;
		const nextMedications = [...draft.medications];
		if (editorIndex >= nextMedications.length) {
			nextMedications.push(editorValue);
		} else {
			nextMedications[editorIndex] = editorValue;
		}
		setDraft((previous) => ({ ...previous, medications: nextMedications }));
		setEditorValue(null);
		setEditorIndex(null);
	};

	const closeMedicationEditor = () => {
		setEditorValue(null);
		setEditorIndex(null);
	};

	return {
		draft,
		setDraft,
		editorValue,
		editorIndex,
		validUntilLocked,
		hasUserEdits,
		setHasUserEdits,
		setEditorValue,
		setEditorIndex,
		handleDraftChange,
		handleAddMedication,
		handleEditMedication,
		handleSaveMedication,
		closeMedicationEditor,
	};
}
