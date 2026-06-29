import { Ionicons } from "@expo/vector-icons";
import { cn, Dialog, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { MedicationEditor } from "@/components/features/prescription/medication-editor";
import type { MedicationDraft } from "@/components/features/prescription/prescription-types";

type MedicationListItemDisplay = {
	subtitle?: boolean;
	schedule?: boolean;
	details?: boolean;
	instructions?: boolean;
	comment?: boolean;
};

type MedicationListItemProps = {
	medication: MedicationDraft;
	subtitle?: string;
	schedule?: string;
	instructions?: string;
	comment?: string;
	display?: MedicationListItemDisplay;
	editable?: boolean;
	onSubmit?: (next: MedicationDraft) => void;
	onPress?: () => void;
	enableEditor?: boolean;
	onEditPage?: () => void;
	showEditPageAction?: boolean;
	footer?: ReactNode;
	className?: string;
	variant?: "plain" | "card" | "compact";
};

function truncateText(text: string, maxLength: number) {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildDetailsLine({
	dosage,
	instructions,
	showInstructions,
}: {
	dosage?: string;
	instructions?: string;
	showInstructions: boolean;
}) {
	const parts = [dosage, showInstructions ? instructions : undefined].filter(
		(part): part is string => Boolean(part?.trim()?.length),
	);
	return parts.join(" - ");
}

function MedicationIcon() {
	const accent = useThemeColor("accent");
	return (
		<View className="border-primary/30 bg-primary/10 h-11 w-11 items-center justify-center rounded-full border">
			<Ionicons name="medkit-outline" size={20} color={accent} />
		</View>
	);
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
				<Dialog.Content className="border-panel-border bg-panel-background rounded-3xl border px-5 pt-4 pb-6">
					<View className="mb-3 flex-row items-center justify-between">
						<Dialog.Title>Edit medication</Dialog.Title>
						<Dialog.Close asChild>
							<Pressable className="border-panel-border h-8 w-8 items-center justify-center rounded-full border">
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

export function MedicationListItem({
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
	variant = "plain",
}: MedicationListItemProps) {
	const editor = useMedicationEditorState(medication, editable, onSubmit);
	const commentLine = comment ?? medication.comment ?? undefined;
	const detailsLine = useMemo(
		() =>
			buildDetailsLine({
				dosage: medication.dosage,
				instructions: instructions ?? medication.instructions ?? undefined,
				showInstructions: Boolean(
					display?.instructions ?? Boolean(instructions),
				),
			}),
		[
			display?.instructions,
			instructions,
			medication.dosage,
			medication.instructions,
		],
	);
	const showSubtitle = display?.subtitle ?? Boolean(subtitle);
	const showSchedule = display?.schedule ?? Boolean(schedule);
	const showDetails = display?.details ?? Boolean(detailsLine);
	const showComment = display?.comment ?? Boolean(commentLine);
	const listContainerClasses =
		variant === "card"
			? "rounded-3xl border border-panel-border bg-panel-background px-4 py-4"
			: variant === "compact"
				? "rounded-2xl border border-panel-border bg-panel-background px-4 py-3"
				: "";
	const showIcon = variant !== "compact";

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
					{showIcon ? <MedicationIcon /> : null}
					<View className="flex-1 gap-1">
						<Text className="text-foreground text-lg font-semibold">
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
							<Text className="text-muted text-sm">
								{truncateText(commentLine, 72)}
							</Text>
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
						className="border-panel-border bg-panel-background mt-1 h-9 w-9 items-center justify-center rounded-full border"
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
