import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Input, Label, TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";

const MIN_DATE = new Date(1920, 0, 1);
const MAX_DATE = new Date();

function formatDate(value: Date | null) {
	if (!value || Number.isNaN(value.getTime())) return "Select date";
	return value.toLocaleDateString();
}

type DatePickerProps = {
	label?: string;
	helperText?: string;
	value?: string | null;
	onChange: (nextValue: string) => void;
	minDate?: Date;
	maxDate?: Date;
};

export function DatePicker({
	label,
	helperText,
	value,
	onChange,
	minDate = MIN_DATE,
	maxDate = MAX_DATE,
}: DatePickerProps) {
	const foreground = useThemeColor("foreground");
	const accentColor = useThemeColor("muted");
	const initialDate = value ? new Date(value) : new Date(1990, 0, 1);
	const [open, setOpen] = React.useState(false);
	const [draftDate, setDraftDate] = React.useState(initialDate);

	React.useEffect(() => {
		if (!value) return;
		const next = new Date(value);
		if (!Number.isNaN(next.getTime())) {
			setDraftDate(next);
		}
	}, [value]);

	const handleConfirm = () => {
		onChange(draftDate.toISOString().slice(0, 10));
		setOpen(false);
	};

	return (
		<View>
			<Pressable onPress={() => setOpen(true)}>
				<TextField>
					{label ? <Label>{label}</Label> : null}
					<Input
						value={formatDate(value ? new Date(value) : null)}
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
							<View className="gap-1">
								<Text className="text-foreground text-lg font-semibold">
									{label ?? "Select date"}
								</Text>
								{helperText ? (
									<Text className="text-muted text-xs">{helperText}</Text>
								) : null}
							</View>
							<DateTimePicker
								mode="date"
								display="spinner"
								value={draftDate}
								minimumDate={minDate}
								maximumDate={maxDate}
								onChange={(_, selected) => {
									if (selected) setDraftDate(selected);
								}}
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
								<Button className="flex-1" onPress={handleConfirm}>
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
