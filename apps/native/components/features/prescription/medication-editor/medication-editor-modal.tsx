import { SafeAreaSheet } from "@/components/base/safe-area-sheet";

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
		<SafeAreaSheet visible={visible} onClose={onClose} contentClassName="px-0">
			<MedicationEditor
				value={value}
				onChange={onChange}
				onSave={onSave}
				isEditable={isEditable}
				showClose
				onClose={onClose}
				layout="sheet"
			/>
		</SafeAreaSheet>
	);
}
