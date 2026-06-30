import { Button, Input, Label, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { DatePicker } from "@/components/base/date-picker/date-picker";
import { Caption } from "@/components/base/typography";

export type ExamFormValues = {
	title: string;
	examDate: string | null;
	doctor: string | null;
	conclusion: string | null;
};

type ExamFormProps = {
	initial?: Partial<ExamFormValues>;
	onSubmit: (values: ExamFormValues) => void;
	isSaving?: boolean;
	submitLabel?: string;
	error?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function ExamForm({
	initial,
	onSubmit,
	isSaving,
	submitLabel = "Enregistrer",
	error,
	onDelete,
	isDeleting,
}: ExamFormProps) {
	const [title, setTitle] = useState(initial?.title ?? "");
	const [examDate, setExamDate] = useState<string | null>(
		initial?.examDate ?? null,
	);
	const [doctor, setDoctor] = useState(initial?.doctor ?? "");
	const [conclusion, setConclusion] = useState(initial?.conclusion ?? "");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = () => {
		if (!title.trim()) {
			setLocalError("Le titre est requis.");
			return;
		}
		setLocalError(null);
		onSubmit({
			title: title.trim(),
			examDate,
			doctor: doctor.trim() || null,
			conclusion: conclusion.trim() || null,
		});
	};

	return (
		<View className="gap-4">
			<TextField>
				<Label>Intitulé</Label>
				<Input
					value={title}
					onChangeText={setTitle}
					placeholder="Prise de sang, IRM genou…"
				/>
			</TextField>

			<View className="gap-2">
				<Caption>Date de l'examen</Caption>
				<DatePicker
					label="Date de l'examen"
					helperText="Touchez pour choisir"
					value={examDate}
					onChange={setExamDate}
				/>
			</View>

			<TextField>
				<Label>Médecin</Label>
				<Input value={doctor} onChangeText={setDoctor} placeholder="Dr. …" />
			</TextField>

			<TextField>
				<Label>Conclusion</Label>
				<Input
					value={conclusion}
					onChangeText={setConclusion}
					placeholder="Conclusion courte"
					multiline
				/>
			</TextField>

			{error || localError ? (
				<Caption className="text-danger">{error ?? localError}</Caption>
			) : null}

			<Button onPress={handleSubmit} isDisabled={isSaving} className="mt-2">
				{isSaving ? (
					<Spinner size="sm" color="default" />
				) : (
					<Button.Label>{submitLabel}</Button.Label>
				)}
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Suppression…" : "Supprimer l'examen"}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
