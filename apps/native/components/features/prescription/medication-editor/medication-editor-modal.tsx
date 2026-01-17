import { Modal, View } from "react-native";

import type { MedicationDraft } from "@/components/features/prescription/prescription-types";
import { MedicationEditor } from "./medication-editor";

type MedicationEditorModalProps = {
	visible: boolean;
	value: MedicationDraft;
	onChange: (next: MedicationDraft) => void;
	onClose: () => void;
	onSave: () => void;
};

export function MedicationEditorModal({
	visible,
	value,
	onChange,
	onClose,
	onSave,
}: MedicationEditorModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/40">
				<MedicationEditor value={value} onChange={onChange} onSave={onSave} />
			</View>
		</Modal>
	);
}
