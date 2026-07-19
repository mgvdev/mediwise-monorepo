import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Input, Label, TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type DateTimePickerFieldProps = {
	/** ISO 8601 instant, or null when nothing has been picked yet. */
	value: string | null;
	onChange: (nextValue: string) => void;
	label?: string;
	helperText?: string;
};

function formatValue(value: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function nextDefaultDate() {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	date.setHours(9, 0, 0, 0);
	return date;
}

/**
 * Date + time field returning an ISO instant. Opens one bottom sheet with a
 * date spinner and a time spinner, mirroring the base DatePicker.
 */
export function DateTimePickerField({
	value,
	onChange,
	label,
	helperText,
}: DateTimePickerFieldProps) {
	const foreground = useThemeColor("foreground");
	const accentColor = useThemeColor("muted");
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<Date>(() => {
		const parsed = value ? new Date(value) : null;
		return parsed && !Number.isNaN(parsed.getTime())
			? parsed
			: nextDefaultDate();
	});

	React.useEffect(() => {
		if (!open) return;
		const parsed = value ? new Date(value) : null;
		setDraft(
			parsed && !Number.isNaN(parsed.getTime()) ? parsed : nextDefaultDate(),
		);
	}, [open, value]);

	const handleChangeDate = (selected?: Date) => {
		if (!selected) return;
		setDraft((current) => {
			const next = new Date(current);
			next.setFullYear(
				selected.getFullYear(),
				selected.getMonth(),
				selected.getDate(),
			);
			return next;
		});
	};

	const handleChangeTime = (selected?: Date) => {
		if (!selected) return;
		setDraft((current) => {
			const next = new Date(current);
			next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
			return next;
		});
	};

	return (
		<View>
			<Pressable onPress={() => setOpen(true)}>
				<TextField>
					{label ? <Label>{label}</Label> : null}
					<Input
						value={formatValue(value)}
						placeholder="Select date and time"
						editable={false}
						pointerEvents="none"
					/>
				</TextField>
				{helperText ? (
					<Text className="text-muted mt-1 text-xs">{helperText}</Text>
				) : null}
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/40"
					onPress={() => setOpen(false)}
				>
					<Pressable className="bg-background rounded-t-3xl px-6 pt-5 pb-8">
						<View className="gap-4">
							<Text className="text-foreground text-lg font-semibold">
								{label ?? "Select date and time"}
							</Text>
							<DateTimePicker
								mode="date"
								display="spinner"
								value={draft}
								onChange={(_, selected) => handleChangeDate(selected)}
								textColor={foreground}
								accentColor={accentColor}
							/>
							<DateTimePicker
								mode="time"
								display="spinner"
								value={draft}
								onChange={(_, selected) => handleChangeTime(selected)}
								textColor={foreground}
								accentColor={accentColor}
							/>
							<View className="flex-row gap-2">
								<Button
									variant="secondary"
									className="flex-1"
									onPress={() => setOpen(false)}
								>
									<Button.Label>Cancel</Button.Label>
								</Button>
								<Button
									className="flex-1"
									onPress={() => {
										onChange(draft.toISOString());
										setOpen(false);
									}}
								>
									<Button.Label>Save</Button.Label>
								</Button>
							</View>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
