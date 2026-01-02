import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Surface } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { MedicationEditorModal } from "@/components/medication-editor";
import { OtpSignIn } from "@/components/otp-sign-in";
import { PrescriptionEditor } from "@/components/prescription-editor";
import {
	createMedicationDraft,
	createPrescriptionDraft,
	type MedicationDraft,
	type PrescriptionDraft,
} from "@/components/prescription-types";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

function addDays(date: Date, days: number) {
	const next = new Date(date.getTime());
	next.setDate(next.getDate() + days);
	return next;
}

function durationToDays(value: number, unit: "day" | "week" | "month") {
	if (unit === "week") return value * 7;
	if (unit === "month") return value * 30;
	return value;
}

function computeValidUntil(issuedDate: string, medications: MedicationDraft[]) {
	const parsed = new Date(issuedDate);
	if (Number.isNaN(parsed.getTime())) return "";
	const durations = medications
		.map((medication) => {
			const count = Number.parseInt(medication.durationValue, 10);
			if (!count) return 0;
			return durationToDays(count, medication.durationUnit);
		})
		.filter((value) => value > 0);
	if (!durations.length) return "";
	const maxDays = Math.max(...durations);
	return addDays(parsed, maxDays).toISOString().slice(0, 10);
}

function mapUnifiedToDraft(data: {
	issuedDate?: string | null;
	validUntil?: string | null;
	prescriberName?: string | null;
	medications?: Array<{
		name: string;
		dosage?: string | null;
		type?: string | null;
		quantity?: string | null;
		frequency?: string | null;
		frequencyCount?: number | null;
		frequencyUnit?: "day" | "week" | "month" | null;
		duration?: string | null;
		durationValue?: number | null;
		durationUnit?: "day" | "week" | "month" | null;
		route?: string | null;
		instructions?: string | null;
	}>;
}) {
	return {
		issuedDate: data.issuedDate ?? "",
		validUntil: data.validUntil ?? "",
		prescriberName: data.prescriberName ?? "",
		medications: (data.medications ?? []).map((medication) =>
			createMedicationDraft({
				name: medication.name ?? "",
				dosage: medication.dosage ?? "",
				type: medication.type ?? medication.route ?? "",
				quantity: medication.quantity ?? "",
				frequencyCount: medication.frequencyCount
					? String(medication.frequencyCount)
					: "",
				frequencyUnit: medication.frequencyUnit ?? "day",
				durationValue: medication.durationValue
					? String(medication.durationValue)
					: "",
				durationUnit: medication.durationUnit ?? "day",
				frequencyText: medication.frequency ?? undefined,
				durationText: medication.duration ?? undefined,
				route: medication.route ?? null,
				instructions: medication.instructions ?? null,
			}),
		),
	};
}

export default function PrescriptionDetailScreen() {
	const { data: session } = authClient.useSession();
	const params = useLocalSearchParams<{ id: string }>();
	const id = String(params.id ?? "");
	const [draft, setDraft] = useState<PrescriptionDraft>(() =>
		createPrescriptionDraft(),
	);
	const [editorValue, setEditorValue] = useState<MedicationDraft | null>(null);
	const [editorIndex, setEditorIndex] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [validUntilLocked, setValidUntilLocked] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const [hasUserEdits, setHasUserEdits] = useState(false);
	const autoUpdateRef = useRef(false);

	const prescriptionQuery = useQuery({
		...trpc.prescriptions.get.queryOptions({ rawId: id, id }),
		enabled: !!session?.user && Boolean(id),
		refetchInterval: 5000,
	});

	const saveMutation = useMutation(
		trpc.prescriptions.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Unable to save prescription.");
			},
		}),
	);

	useEffect(() => {
		if (!prescriptionQuery.data?.unified || hasInitialized || hasUserEdits)
			return;
		const unified = prescriptionQuery.data.unified;
		const mapped = mapUnifiedToDraft(unified.data);
		setDraft((previous) => ({
			...previous,
			...mapped,
		}));
		setHasInitialized(true);
	}, [hasInitialized, hasUserEdits, prescriptionQuery.data?.unified]);

	useEffect(() => {
		if (validUntilLocked) return;
		const nextValidUntil = computeValidUntil(
			draft.issuedDate,
			draft.medications,
		);
		if (!nextValidUntil || nextValidUntil === draft.validUntil) return;
		autoUpdateRef.current = true;
		setDraft((previous) => ({ ...previous, validUntil: nextValidUntil }));
		autoUpdateRef.current = false;
	}, [draft.issuedDate, draft.medications, draft.validUntil, validUntilLocked]);

	const handleDraftChange = (next: PrescriptionDraft) => {
		if (!autoUpdateRef.current && next.validUntil !== draft.validUntil) {
			setValidUntilLocked(next.validUntil.trim().length > 0);
		}
		setHasUserEdits(true);
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

	const buildPayload = (current: PrescriptionDraft) => {
		return {
			id: prescriptionQuery.data?.unified?.id,
			rawId: prescriptionQuery.data?.raw?.id ?? null,
			issuedDate: current.issuedDate.trim() || null,
			validUntil: current.validUntil.trim() || null,
			prescriberName: current.prescriberName.trim() || null,
			medications: current.medications.map((medication) => {
				const frequencyCount = Number.parseInt(medication.frequencyCount, 10);
				const durationValue = Number.parseInt(medication.durationValue, 10);
				const frequencyText =
					frequencyCount && medication.frequencyUnit
						? `${frequencyCount} per ${medication.frequencyUnit}`
						: (medication.frequencyText ?? null);
				const durationText =
					durationValue && medication.durationUnit
						? `${durationValue} ${medication.durationUnit}`
						: (medication.durationText ?? null);
				return {
					name: medication.name.trim(),
					dosage: medication.dosage.trim() || null,
					type: medication.type.trim() || null,
					quantity: medication.quantity.trim() || null,
					frequency: frequencyText,
					frequencyCount: Number.isNaN(frequencyCount) ? null : frequencyCount,
					frequencyUnit: medication.frequencyCount
						? medication.frequencyUnit
						: null,
					duration: durationText,
					durationValue: Number.isNaN(durationValue) ? null : durationValue,
					durationUnit: medication.durationValue
						? medication.durationUnit
						: null,
					route: medication.route ?? null,
					instructions: medication.instructions ?? null,
				};
			}),
			notes: current.notes?.trim() || null,
		};
	};

	const handleSave = async () => {
		setError(null);
		if (!draft.medications.length) {
			setError("Add at least one medication.");
			return;
		}
		if (draft.medications.some((medication) => !medication.name.trim())) {
			setError("Each medication needs a name.");
			return;
		}
		try {
			const payload = buildPayload(draft);
			await saveMutation.mutateAsync(payload);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Save failed.");
		}
	};

	if (!session?.user) {
		return (
			<Container className="p-6">
				<View className="mb-6 py-4">
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Prescriptions
					</Text>
					<Text className="text-muted text-sm">
						Sign in to manage prescriptions.
					</Text>
				</View>
				<OtpSignIn />
			</Container>
		);
	}

	const raw = prescriptionQuery.data?.raw;
	const unified = prescriptionQuery.data?.unified;
	const isProcessing = raw && raw.status !== "completed" && !unified;

	return (
		<Container className="gap-5 pb-10">
			<View className="px-6">
				{isProcessing ? (
					<Surface variant="secondary" className="mb-4 rounded-2xl p-4">
						<Text className="font-semibold text-foreground text-sm">
							Processing prescription
						</Text>
						<Text className="text-muted text-xs">
							We are extracting details. You can still edit manually if needed.
						</Text>
					</Surface>
				) : null}

				<PrescriptionEditor
					title="Unified prescription"
					subtitle="Review the extracted info and make any corrections."
					value={draft}
					onChange={handleDraftChange}
					onAddMedication={handleAddMedication}
					onEditMedication={handleEditMedication}
					onSave={handleSave}
					isSaving={saveMutation.isPending}
					error={error}
					footerLabel={saveMutation.isPending ? "Saving..." : "Continue"}
				/>
			</View>

			<MedicationEditorModal
				visible={!!editorValue}
				value={editorValue ?? createMedicationDraft()}
				onChange={(next) => setEditorValue(next)}
				onClose={() => {
					setEditorValue(null);
					setEditorIndex(null);
				}}
				onSave={handleSaveMedication}
			/>
		</Container>
	);
}
