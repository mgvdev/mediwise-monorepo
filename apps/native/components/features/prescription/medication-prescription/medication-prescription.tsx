import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { MedicationEditor } from "@/components/features/prescription/medication-editor";
import {
	MedicationShape,
	type MedicationShapeId,
} from "@/components/features/prescription/medication-shape";
import type { MedicationDraft } from "@/components/features/prescription/prescription-types";

const DEFAULT_SHAPE: MedicationShapeId = "capsule";

type MedicationPrescriptionDisplay = {
	subtitle?: boolean;
	schedule?: boolean;
	details?: boolean;
	instructions?: boolean;
	comment?: boolean;
};

type MedicationPrescriptionBaseProps = {
	medication: MedicationDraft;
	subtitle?: string;
	schedule?: string;
	instructions?: string;
	comment?: string;
	display?: MedicationPrescriptionDisplay;
	editable?: boolean;
	onSubmit?: (next: MedicationDraft) => void;
	footer?: ReactNode;
	className?: string;
};

function truncateText(text: string, maxLength: number) {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildDetailsLine({
	dosage,
	form,
	instructions,
	showInstructions,
}: {
	dosage?: string;
	form?: string;
	instructions?: string;
	showInstructions: boolean;
}) {
	const parts = [
		dosage,
		form,
		showInstructions ? instructions : undefined,
	].filter((part): part is string => Boolean(part?.trim()?.length));
	return parts.join(" - ");
}

function useMedicationEditorState(
	medication: MedicationDraft,
	editable: boolean,
	onSubmit?: (next: MedicationDraft) => void,
) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<MedicationDraft>(medication);

	useEffect(() => {
		setDraft(medication);
	}, [medication]);

	const handleSave = () => {
		if (editable && onSubmit) {
			onSubmit(draft);
		}
		setOpen(false);
	};

	return {
		draft,
		setDraft,
		open,
		setOpen,
		handleSave,
	};
}

function MedicationEditorSheet({
	open,
	onClose,
	draft,
	onDraftChange,
	onSave,
}: {
	open: boolean;
	onClose: () => void;
	draft: MedicationDraft;
	onDraftChange: (next: MedicationDraft) => void;
	onSave?: () => void;
}) {
	return (
		<Modal visible={open} transparent animationType="slide">
			<View className="flex-1 justify-end bg-black/30">
				<View className="flex-1" style={{ maxHeight: "90%" }}>
					<MedicationEditor
						value={draft}
						onChange={onDraftChange}
						onSave={onSave}
						showClose
						onClose={onClose}
						layout="sheet"
					/>
				</View>
			</View>
		</Modal>
	);
}

export function MedicationPrescriptionCard({
	medication,
	subtitle,
	schedule,
	instructions,
	comment,
	display,
	editable = false,
	onSubmit,
	footer,
	className,
}: MedicationPrescriptionBaseProps) {
	const editor = useMedicationEditorState(medication, editable, onSubmit);
	const commentLine = comment ?? medication.comment ?? undefined;
	const detailsLine = useMemo(
		() =>
			buildDetailsLine({
				dosage: medication.dosage,
				form: medication.type,
				instructions: instructions ?? medication.instructions ?? undefined,
				showInstructions: Boolean(display?.instructions),
			}),
		[
			display?.instructions,
			instructions,
			medication.dosage,
			medication.type,
			medication.instructions,
		],
	);
	const showSubtitle = display?.subtitle ?? Boolean(subtitle);
	const showSchedule = display?.schedule ?? Boolean(schedule);
	const showDetails = display?.details ?? Boolean(detailsLine);
	const showComment = display?.comment ?? Boolean(commentLine);

	return (
		<View className={cn("gap-3", className)}>
			<Pressable
				onPress={() => editor.setOpen(true)}
				className="items-center gap-4 rounded-3xl border border-panel-border bg-panel-background px-6 py-6"
			>
				<MedicationShape
					shape={medication.shape ?? DEFAULT_SHAPE}
					size={76}
					iconSize={36}
					showLabel={false}
				/>
				<View className="items-center gap-2">
					<Text className="font-semibold text-foreground text-xl">
						{medication.name}
					</Text>
					{showSubtitle ? (
						<Text className="text-base text-muted">{subtitle}</Text>
					) : null}
					{showSchedule ? (
						<Text className="text-primary text-sm">{schedule}</Text>
					) : null}
				</View>
				{showDetails ? (
					<Text className="text-muted text-sm">{detailsLine}</Text>
				) : null}
				{showComment && commentLine ? (
					<Text className="text-muted text-sm">
						{truncateText(commentLine, 72)}
					</Text>
				) : null}
			</Pressable>
			{footer ? <View>{footer}</View> : null}
			<MedicationEditorSheet
				open={editor.open}
				onClose={() => editor.setOpen(false)}
				draft={editor.draft}
				onDraftChange={editor.setDraft}
				onSave={editable ? editor.handleSave : undefined}
			/>
		</View>
	);
}

export function MedicationPrescriptionListItem({
	medication,
	subtitle,
	schedule,
	instructions,
	comment,
	display,
	editable = false,
	onSubmit,
	footer,
	className,
	listVariant = "plain",
}: MedicationPrescriptionBaseProps & { listVariant?: "plain" | "card" }) {
	const editor = useMedicationEditorState(medication, editable, onSubmit);
	const commentLine = comment ?? medication.comment ?? undefined;
	const detailsLine = useMemo(
		() =>
			buildDetailsLine({
				dosage: medication.dosage,
				form: medication.type,
				instructions: instructions ?? medication.instructions ?? undefined,
				showInstructions: Boolean(
					display?.instructions ?? Boolean(instructions),
				),
			}),
		[
			display?.instructions,
			instructions,
			medication.dosage,
			medication.type,
			medication.instructions,
		],
	);
	const showSubtitle = display?.subtitle ?? Boolean(subtitle);
	const showSchedule = display?.schedule ?? Boolean(schedule);
	const showDetails = display?.details ?? Boolean(detailsLine);
	const showComment = display?.comment ?? Boolean(commentLine);
	const listContainerClasses =
		listVariant === "card"
			? "rounded-3xl border border-panel-border bg-panel-background px-4 py-4"
			: "";

	return (
		<View className={cn("gap-3", className)}>
			<Pressable
				onPress={() => editor.setOpen(true)}
				className={cn("flex-row items-start gap-4", listContainerClasses)}
			>
				<MedicationShape
					shape={medication.shape ?? DEFAULT_SHAPE}
					size={58}
					iconSize={28}
					showLabel={false}
				/>
				<View className="flex-1 gap-1">
					<Text className="font-semibold text-foreground text-lg">
						{medication.name}
					</Text>
					{showSubtitle ? (
						<Text className="text-muted text-sm">{subtitle}</Text>
					) : null}
					{showSchedule ? (
						<Text className="text-primary text-sm">{schedule}</Text>
					) : null}
					{showDetails ? (
						<Text className="text-muted text-sm">{detailsLine}</Text>
					) : null}
					{showComment && commentLine ? (
						<Text className="text-muted text-sm">{commentLine}</Text>
					) : null}
				</View>
				<Ionicons name="chevron-forward" size={18} className="text-muted" />
			</Pressable>
			{footer ? <View>{footer}</View> : null}
			<MedicationEditorSheet
				open={editor.open}
				onClose={() => editor.setOpen(false)}
				draft={editor.draft}
				onDraftChange={editor.setDraft}
				onSave={editable ? editor.handleSave : undefined}
			/>
		</View>
	);
}

export type { MedicationPrescriptionBaseProps, MedicationPrescriptionDisplay };
