import { Button, Surface } from "heroui-native";
import { Image, Linking, Text, View } from "react-native";

import { MedicationEditorModal } from "@/components/medication-editor";
import { OtpSignIn } from "@/components/otp-sign-in";
import { PrescriptionEditor } from "@/components/prescription-editor";
import { createMedicationDraft } from "@/components/prescription-types";
import { useManualPrescriptionForm } from "@/features/prescriptions/use-manual-prescription-form";
import { usePrescriptionDetailForm } from "@/features/prescriptions/use-prescription-detail-form";

export function ManualPrescriptionForm({
	onSaved,
}: {
	onSaved?: (id: string) => void;
}) {
	const { session, error, isSaving, handleSave, photo, draftState } =
		useManualPrescriptionForm({ onSaved });

	if (!session?.user) {
		return <OtpSignIn />;
	}

	const photoCard = (
		<Surface variant="secondary" className="rounded-2xl p-4">
			<Text className="font-semibold text-base text-foreground">
				Prescription photo
			</Text>
			<Text className="text-muted text-xs">
				Recommended: attach a photo for verification.
			</Text>

			<View className="mt-3 gap-3">
				{photo.asset ? (
					<Image
						source={{ uri: photo.asset.uri }}
						className="h-40 w-full rounded-xl"
						resizeMode="cover"
					/>
				) : null}
				<View className="flex-row gap-2">
					<Button variant="secondary" onPress={photo.handlePickFromLibrary}>
						<Button.Label>Upload</Button.Label>
					</Button>
					<Button onPress={photo.handleTakePhoto}>
						<Button.Label>Scan</Button.Label>
					</Button>
				</View>
				{photo.photoError ? (
					<Text className="text-danger text-xs">{photo.photoError}</Text>
				) : null}
			</View>
		</Surface>
	);

	return (
		<View className="gap-4">
			{photo.permissionError ? (
				<Surface variant="secondary" className="rounded-2xl p-4">
					<Text className="font-medium text-foreground text-sm">
						{photo.permissionError === "camera"
							? "Camera access needed"
							: "Photo library access needed"}
					</Text>
					<Text className="mt-1 text-muted text-xs">
						Enable access to continue. You can retry or open system settings.
					</Text>
					<View className="mt-3 flex-row gap-2">
						<Button variant="secondary" onPress={photo.handlePermissionRetry}>
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
				value={draftState.draft}
				onChange={draftState.handleDraftChange}
				onAddMedication={draftState.handleAddMedication}
				onEditMedication={draftState.handleEditMedication}
				onSave={handleSave}
				isSaving={isSaving}
				error={error}
				topContent={photoCard}
				footerLabel={isSaving ? "Saving..." : "Continue"}
			/>

			<MedicationEditorModal
				visible={!!draftState.editorValue}
				value={draftState.editorValue ?? createMedicationDraft()}
				onChange={(next) => draftState.setEditorValue(next)}
				onClose={draftState.closeMedicationEditor}
				onSave={draftState.handleSaveMedication}
			/>
		</View>
	);
}

type PrescriptionDetailFormProps = {
	prescriptionId: string;
	onSaved?: () => void;
};

export function PrescriptionDetailForm({
	prescriptionId,
	onSaved,
}: PrescriptionDetailFormProps) {
	const { session, error, isSaving, isProcessing, handleSave, draftState } =
		usePrescriptionDetailForm({ prescriptionId, onSaved });

	if (!session?.user) {
		return <OtpSignIn />;
	}

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
				value={draftState.draft}
				onChange={draftState.handleDraftChange}
				onAddMedication={draftState.handleAddMedication}
				onEditMedication={draftState.handleEditMedication}
				onSave={handleSave}
				isSaving={isSaving}
				error={error}
				footerLabel={isSaving ? "Saving..." : "Continue"}
			/>

			<MedicationEditorModal
				visible={!!draftState.editorValue}
				value={draftState.editorValue ?? createMedicationDraft()}
				onChange={(next) => draftState.setEditorValue(next)}
				onClose={draftState.closeMedicationEditor}
				onSave={draftState.handleSaveMedication}
			/>
		</View>
	);
}
