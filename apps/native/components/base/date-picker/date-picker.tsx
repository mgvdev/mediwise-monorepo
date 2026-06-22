import DateTimePicker from "@react-native-community/datetimepicker";
import {
	Button,
	Dialog,
	Input,
	Label,
	TextField,
	useThemeColor,
} from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

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
		<Dialog isOpen={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Pressable>
					<TextField>
						{label ? <Label>{label}</Label> : null}
						<Input
							value={formatDate(value ? new Date(value) : null)}
							editable={false}
							pointerEvents="none"
						/>
					</TextField>
					{helperText ? (
						<Text className="mt-1 text-muted text-xs">{helperText}</Text>
					) : null}
				</Pressable>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content>
					<View className="gap-4">
						<View className="gap-1">
							<Dialog.Title>{label ?? "Select date"}</Dialog.Title>
							{helperText ? (
								<Dialog.Description>{helperText}</Dialog.Description>
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
							<Dialog.Close asChild>
								<Button variant="secondary" className="flex-1">
									<Button.Label>Cancel</Button.Label>
								</Button>
							</Dialog.Close>
							<Button className="flex-1" onPress={handleConfirm}>
								<Button.Label>Save</Button.Label>
							</Button>
						</View>
					</View>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
