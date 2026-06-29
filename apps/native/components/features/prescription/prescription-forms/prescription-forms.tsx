import { Button, Dialog, Surface } from "heroui-native";
import { useState } from "react";
import { Image, Linking, Text, View } from "react-native";

import { MedicationEditor } from "@/components/features/prescription/medication-editor";
import { PrescriptionEditor } from "@/components/features/prescription/prescription-editor";
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
		return null;
	}

	if (draftState.editorValue) {
		return (
			<View className="gap-4">
				<MedicationEditor
					value={draftState.editorValue}
					onChange={(next) => draftState.setEditorValue(next)}
					onSave={draftState.handleSaveMedication}
					onClose={draftState.closeMedicationEditor}
					showClose
					layout="inline"
					animateIn
				/>
			</View>
		);
	}

	const photoCard = (
		<Surface variant="secondary" className="rounded-2xl p-4">
			<Text className="text-foreground text-base font-semibold">
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
					<Text className="text-foreground text-sm font-medium">
						{photo.permissionError === "camera"
							? "Camera access needed"
							: "Photo library access needed"}
					</Text>
					<Text className="text-muted mt-1 text-xs">
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

			{null}
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
	const {
		session,
		error,
		isSaving,
		isProcessing,
		isFailed,
		documentType,
		handleSave,
		handleDelete,
		isDeleting,
		canDelete,
		draftState,
	} = usePrescriptionDetailForm({ prescriptionId, onSaved });
	const [forceEdit, setForceEdit] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const medicationNames = draftState.draft.medications
		.map((medication) => medication.name.trim())
		.filter(Boolean);
	const deleteTargetLabel =
		medicationNames.length > 0
			? medicationNames.join(", ")
			: "cette ordonnance";

	if (!session?.user) {
		return null;
	}

	// Non-prescription documents shouldn't push the user into a medication form.
	if (!forceEdit && (documentType === "report" || documentType === "unknown")) {
		const isReport = documentType === "report";
		return (
			<View className="gap-4">
				<Surface variant="secondary" className="rounded-2xl p-4">
					<Text className="text-foreground text-base font-semibold">
						{isReport ? "Medical report detected" : "Unrecognized document"}
					</Text>
					<Text className="text-muted mt-1 text-xs">
						{isReport
							? "Report management is coming soon. We've saved this scan for you."
							: "We couldn't recognize this document. You can still edit it as a prescription."}
					</Text>
					<View className="mt-3 flex-row gap-2">
						{!isReport ? (
							<Button variant="secondary" onPress={() => setForceEdit(true)}>
								<Button.Label>Edit as prescription</Button.Label>
							</Button>
						) : null}
						<Button onPress={() => onSaved?.()}>
							<Button.Label>Done</Button.Label>
						</Button>
					</View>
				</Surface>
			</View>
		);
	}

	if (draftState.editorValue) {
		return (
			<View className="gap-4">
				<MedicationEditor
					value={draftState.editorValue}
					onChange={(next) => draftState.setEditorValue(next)}
					onSave={draftState.handleSaveMedication}
					onClose={draftState.closeMedicationEditor}
					showClose
					layout="inline"
					animateIn
				/>
			</View>
		);
	}

	return (
		<View className="gap-4">
			{isProcessing ? (
				<Surface variant="secondary" className="rounded-2xl p-4">
					<Text className="text-foreground text-sm font-semibold">
						Processing prescription
					</Text>
					<Text className="text-muted text-xs">
						We are extracting details. You can still edit manually if needed.
					</Text>
				</Surface>
			) : null}

			{isFailed ? (
				<Surface variant="secondary" className="rounded-2xl p-4">
					<Text className="text-danger text-sm font-semibold">
						Extraction failed
					</Text>
					<Text className="text-muted text-xs">
						We couldn't read this document automatically. You can enter the
						details manually below.
					</Text>
				</Surface>
			) : null}

			<PrescriptionEditor
				title="Edit prescription"
				subtitle="Update prescription details and medications."
				value={draftState.draft}
				onChange={draftState.handleDraftChange}
				onAddMedication={draftState.handleAddMedication}
				onEditMedication={draftState.handleEditMedication}
				onSave={handleSave}
				isSaving={isSaving}
				error={error}
				footerLabel={isSaving ? "Saving..." : "Continue"}
				onDelete={canDelete ? () => setConfirmDelete(true) : undefined}
				isDeleting={isDeleting}
			/>

			<Dialog isOpen={confirmDelete} onOpenChange={setConfirmDelete}>
				<Dialog.Portal>
					<Dialog.Overlay className="bg-black/40" />
					<Dialog.Content className="border-panel-border bg-panel-background rounded-3xl border px-5 pt-4 pb-6">
						<Dialog.Title>Supprimer le traitement</Dialog.Title>
						<Dialog.Description>
							Vous allez supprimer {deleteTargetLabel}. Cette action est
							irréversible.
						</Dialog.Description>
						<View className="mt-4 flex-row justify-end gap-2">
							<Button
								variant="secondary"
								onPress={() => setConfirmDelete(false)}
								isDisabled={isDeleting}
							>
								<Button.Label>Annuler</Button.Label>
							</Button>
							<Button
								variant="secondary"
								className="border-danger/40"
								isDisabled={isDeleting}
								onPress={async () => {
									await handleDelete();
									setConfirmDelete(false);
								}}
							>
								<Button.Label className="text-danger">
									{isDeleting ? "Suppression..." : "Supprimer"}
								</Button.Label>
							</Button>
						</View>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog>
		</View>
	);
}
