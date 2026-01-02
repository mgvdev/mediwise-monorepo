import { env } from "@mediwise-monorepo/env/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Button, Surface } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Image, Linking, Text, View } from "react-native";

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

type SelectedAsset = ImagePicker.ImagePickerAsset;
type UploadSource = "camera" | "upload";

// Toggle this when insurer profile settings expose a hard photo requirement.
const REQUIRE_PRESCRIPTION_PHOTO = false;

function resolveFilename(asset: SelectedAsset) {
	if (asset.fileName) return asset.fileName;
	const uriParts = asset.uri.split("/");
	return uriParts[uriParts.length - 1] || `prescription-${Date.now()}.jpg`;
}

function resolveMimeType(asset: SelectedAsset) {
	return asset.mimeType || "image/jpeg";
}

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

export function ManualPrescriptionForm({
	onSaved,
}: {
	onSaved?: (id: string) => void;
}) {
	const { data: session } = authClient.useSession();
	const [asset, setAsset] = useState<SelectedAsset | null>(null);
	const [uploadSource, setUploadSource] = useState<UploadSource | null>(null);
	const [rawId, setRawId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [permissionError, setPermissionError] = useState<
		"camera" | "library" | null
	>(null);

	const [draft, setDraft] = useState<PrescriptionDraft>(() => {
		const initial = createPrescriptionDraft();
		initial.issuedDate = new Date().toISOString().slice(0, 10);
		return initial;
	});
	const [editorValue, setEditorValue] = useState<MedicationDraft | null>(null);
	const [editorIndex, setEditorIndex] = useState<number | null>(null);
	const [validUntilLocked, setValidUntilLocked] = useState(false);
	const autoUpdateRef = useRef(false);

	const saveMutation = useMutation(
		trpc.prescriptions.save.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries();
				onSaved?.(data.id);
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Unable to save prescription.");
			},
		}),
	);

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
		setDraft(next);
	};

	const requestCameraPermission = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "camera");
		return allowed;
	};

	const requestLibraryPermission = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "library");
		return allowed;
	};

	const handlePickFromLibrary = async () => {
		setPhotoError(null);
		const allowed = await requestLibraryPermission();
		if (!allowed) {
			setPhotoError("Photo library permission is required.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.8,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("upload");
		}
	};

	const handleTakePhoto = async () => {
		setPhotoError(null);
		const allowed = await requestCameraPermission();
		if (!allowed) {
			setPhotoError("Camera permission is required.");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			quality: 0.8,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("camera");
		}
	};

	const handlePermissionRetry = async () => {
		if (permissionError === "camera") {
			await requestCameraPermission();
		}
		if (permissionError === "library") {
			await requestLibraryPermission();
		}
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

	const uploadPhoto = async () => {
		if (!asset || rawId) return rawId;
		if (!uploadSource) return rawId;

		const formData = new FormData();
		formData.append("file", {
			uri: asset.uri,
			name: resolveFilename(asset),
			type: resolveMimeType(asset),
		} as never);
		formData.append("source", uploadSource);
		formData.append("intent", "manual");

		const headers: Record<string, string> = {};
		const cookies = authClient.getCookie();
		if (cookies) {
			headers.Cookie = cookies;
		}

		const response = await fetch(
			`${env.EXPO_PUBLIC_SERVER_URL}/api/prescriptions/upload`,
			{
				method: "POST",
				body: formData,
				headers,
			},
		);

		if (!response.ok) {
			throw new Error("Upload failed.");
		}

		const data = (await response.json()) as { id?: string };
		if (data.id) {
			setRawId(data.id);
			return data.id;
		}
		return rawId;
	};

	const buildPayload = (
		current: PrescriptionDraft,
		rawIdValue: string | null,
	) => {
		return {
			rawId: rawIdValue,
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
		if (REQUIRE_PRESCRIPTION_PHOTO && !asset && !rawId) {
			setError("Add a prescription photo before saving.");
			return;
		}

		try {
			const uploadedRawId = asset && !rawId ? await uploadPhoto() : rawId;
			const payload = buildPayload(draft, uploadedRawId ?? null);
			await saveMutation.mutateAsync(payload);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Save failed.");
		}
	};

	const photoCard = (
		<Surface variant="secondary" className="rounded-2xl p-4">
			<Text className="font-semibold text-base text-foreground">
				Prescription photo
			</Text>
			<Text className="text-muted text-xs">
				Recommended: attach a photo for verification.
			</Text>

			<View className="mt-3 gap-3">
				{asset ? (
					<Image
						source={{ uri: asset.uri }}
						className="h-40 w-full rounded-xl"
						resizeMode="cover"
					/>
				) : null}
				<View className="flex-row gap-2">
					<Button variant="secondary" onPress={handlePickFromLibrary}>
						<Button.Label>Upload</Button.Label>
					</Button>
					<Button onPress={handleTakePhoto}>
						<Button.Label>Scan</Button.Label>
					</Button>
				</View>
				{photoError ? (
					<Text className="text-danger text-xs">{photoError}</Text>
				) : null}
			</View>
		</Surface>
	);

	if (!session?.user) {
		return <OtpSignIn />;
	}

	return (
		<View className="gap-4">
			{permissionError ? (
				<Surface variant="secondary" className="rounded-2xl p-4">
					<Text className="font-medium text-foreground text-sm">
						{permissionError === "camera"
							? "Camera access needed"
							: "Photo library access needed"}
					</Text>
					<Text className="mt-1 text-muted text-xs">
						Enable access to continue. You can retry or open system settings.
					</Text>
					<View className="mt-3 flex-row gap-2">
						<Button variant="secondary" onPress={handlePermissionRetry}>
							<Button.Label>Try again</Button.Label>
						</Button>
						<Button onPress={() => Linking.openSettings()}>
							<Button.Label>Open settings</Button.Label>
						</Button>
					</View>
				</Surface>
			) : null}

			<PrescriptionEditor
				title="Add Prescription"
				subtitle="Enter prescription details and medications."
				value={draft}
				onChange={handleDraftChange}
				onAddMedication={handleAddMedication}
				onEditMedication={handleEditMedication}
				onSave={handleSave}
				isSaving={saveMutation.isPending}
				error={error}
				topContent={photoCard}
				footerLabel={saveMutation.isPending ? "Saving..." : "Continue"}
			/>

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
		</View>
	);
}

type PrescriptionDetailFormProps = {
	prescriptionId: string;
	onSaved?: () => void;
};

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

export function PrescriptionDetailForm({
	prescriptionId,
	onSaved,
}: PrescriptionDetailFormProps) {
	const { data: session } = authClient.useSession();
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
		...trpc.prescriptions.get.queryOptions({
			rawId: prescriptionId,
			id: prescriptionId,
		}),
		enabled: !!session?.user && Boolean(prescriptionId),
		refetchInterval: 5000,
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

	useEffect(() => {
		if (!prescriptionQuery.data?.unified || hasInitialized || hasUserEdits) {
			return;
		}
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
		return <OtpSignIn />;
	}

	const raw = prescriptionQuery.data?.raw;
	const unified = prescriptionQuery.data?.unified;
	const isProcessing = raw && raw.status !== "completed" && !unified;

	return (
		<View className="gap-4">
			{isProcessing ? (
				<Surface variant="secondary" className="rounded-2xl p-4">
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
		</View>
	);
}
