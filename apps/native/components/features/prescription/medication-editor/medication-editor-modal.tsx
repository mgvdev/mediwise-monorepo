import { Modal, View } from "react-native";

import type { MedicationDraft } from "@/components/features/prescription/prescription-types";
import { MedicationEditor } from "./medication-editor";

type MedicationEditorModalProps = {
	visible: boolean;
	value: MedicationDraft;
	onChange: (next: MedicationDraft) => void;
	onClose: () => void;
	onSave: () => void;
	isEditable?: boolean;
};

export function MedicationEditorModal({
	visible,
	value,
	onChange,
	onClose,
	onSave,
	isEditable = true,
}: MedicationEditorModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/40">
				<View className="flex-1" style={{ maxHeight: "90%" }}>
					<MedicationEditor
						value={value}
						onChange={onChange}
						onSave={onSave}
						isEditable={isEditable}
						showClose
						onClose={onClose}
						layout="sheet"
					/>
				</View>
			</View>
		</Modal>
	);
}
