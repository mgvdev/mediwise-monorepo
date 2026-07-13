import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, useThemeColor } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";

function toDate(time: string) {
	const [h, m] = time.split(":");
	const date = new Date();
	date.setHours(Number.parseInt(h ?? "9", 10));
	date.setMinutes(Number.parseInt(m ?? "0", 10));
	date.setSeconds(0);
	return date;
}

function toHHmm(date: Date) {
	const h = `${date.getHours()}`.padStart(2, "0");
	const m = `${date.getMinutes()}`.padStart(2, "0");
	return `${h}:${m}`;
}

type TimePickerModalProps = {
	visible: boolean;
	value: string;
	title?: string;
	onCancel: () => void;
	onConfirm: (time: string) => void;
};

/**
 * Bottom-sheet style time picker returning an "HH:mm" string. Mirrors the base
 * DatePicker modal, in time mode.
 */
export function TimePickerModal({
	visible,
	value,
	title = "Set time",
	onCancel,
	onConfirm,
}: TimePickerModalProps) {
	const foreground = useThemeColor("foreground");
	const accentColor = useThemeColor("muted");
	const [draft, setDraft] = React.useState(() => toDate(value));

	React.useEffect(() => {
		if (visible) setDraft(toDate(value));
	}, [visible, value]);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onCancel}
		>
			<Pressable className="flex-1 justify-end bg-black/40" onPress={onCancel}>
				<Pressable className="bg-background rounded-t-3xl px-6 pt-5 pb-8">
					<View className="gap-4">
						<Text className="text-foreground text-lg font-semibold">
							{title}
						</Text>
						<DateTimePicker
							mode="time"
							display="spinner"
							value={draft}
							onChange={(_, selected) => {
								if (selected) setDraft(selected);
							}}
							textColor={foreground}
							accentColor={accentColor}
						/>
						<View className="flex-row gap-2">
							<Button variant="secondary" className="flex-1" onPress={onCancel}>
								<Button.Label>Cancel</Button.Label>
							</Button>
							<Button
								className="flex-1"
								onPress={() => onConfirm(toHHmm(draft))}
							>
								<Button.Label>Save</Button.Label>
							</Button>
						</View>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
