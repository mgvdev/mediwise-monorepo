import { Ionicons } from "@expo/vector-icons";
import { cn, Dialog } from "heroui-native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
	onPress?: () => void;
	enableEditor?: boolean;
	onEditPage?: () => void;
	showEditPageAction?: boolean;
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

function MedicationEditorDialog({
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
		<Dialog isOpen={open} onOpenChange={(next) => (!next ? onClose() : null)}>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content className="rounded-3xl border border-panel-border bg-panel-background px-5 pt-4 pb-6">
					<View className="mb-3 flex-row items-center justify-between">
						<Dialog.Title>Edit medication</Dialog.Title>
						<Dialog.Close asChild>
							<Pressable className="h-8 w-8 items-center justify-center rounded-full border border-panel-border">
								<Ionicons name="close" size={16} className="text-muted" />
							</Pressable>
						</Dialog.Close>
					</View>
					<View className="max-h-[560px]">
						<MedicationEditor
							value={draft}
							onChange={onDraftChange}
							onSave={onSave}
							showClose={false}
							showHeader={false}
							variant="plain"
							layout="inline"
						/>
					</View>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
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
	onPress,
	enableEditor = true,
	onEditPage,
	showEditPageAction = false,
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
			<View className="flex-row items-start gap-3">
				<Pressable
					onPress={() => {
						if (onPress) {
							onPress();
							return;
						}
						if (enableEditor) {
							editor.setOpen(true);
						}
					}}
					className="flex-1 items-center gap-4 rounded-3xl border border-panel-border bg-panel-background px-6 py-6"
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
				{showEditPageAction && onEditPage ? (
					<Pressable
						onPress={(event) => {
							event.stopPropagation();
							onEditPage();
						}}
						className="mt-2 h-9 w-9 items-center justify-center rounded-full border border-panel-border bg-panel-background"
						accessibilityRole="button"
						accessibilityLabel="Edit medication in full page"
					>
						<Ionicons name="add" size={18} className="text-muted" />
					</Pressable>
				) : null}
			</View>
			{footer ? <View>{footer}</View> : null}
			{enableEditor ? (
				<MedicationEditorDialog
					open={editor.open}
					onClose={() => editor.setOpen(false)}
					draft={editor.draft}
					onDraftChange={editor.setDraft}
					onSave={editable ? editor.handleSave : undefined}
				/>
			) : null}
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
	onPress,
	enableEditor = true,
	onEditPage,
	showEditPageAction = false,
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
			<View className="flex-row items-start gap-3">
				<Pressable
					onPress={() => {
						if (onPress) {
							onPress();
							return;
						}
						if (enableEditor) {
							editor.setOpen(true);
						}
					}}
					className={cn(
						"flex-1 flex-row items-start gap-4",
						listContainerClasses,
					)}
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
				{showEditPageAction && onEditPage ? (
					<Pressable
						onPress={(event) => {
							event.stopPropagation();
							onEditPage();
						}}
						className="mt-1 h-9 w-9 items-center justify-center rounded-full border border-panel-border bg-panel-background"
						accessibilityRole="button"
						accessibilityLabel="Edit medication in full page"
					>
						<Ionicons name="add" size={18} className="text-muted" />
					</Pressable>
				) : null}
			</View>
			{footer ? <View>{footer}</View> : null}
			{enableEditor ? (
				<MedicationEditorDialog
					open={editor.open}
					onClose={() => editor.setOpen(false)}
					draft={editor.draft}
					onDraftChange={editor.setDraft}
					onSave={editable ? editor.handleSave : undefined}
				/>
			) : null}
		</View>
	);
}

export type { MedicationPrescriptionBaseProps, MedicationPrescriptionDisplay };
