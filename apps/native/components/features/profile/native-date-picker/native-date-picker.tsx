import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColor } from "heroui-native";
import * as React from "react";
import { Platform, Pressable, Text, View } from "react-native";

const MIN_DATE = new Date(1920, 0, 1);
const MAX_DATE = new Date();

function formatDate(value: Date | null) {
	if (!value || Number.isNaN(value.getTime())) return "Select date";
	return value.toLocaleDateString();
}

type NativeDatePickerProps = {
	value?: string | null;
	onChange: (nextValue: string) => void;
};

export function NativeDatePicker({ value, onChange }: NativeDatePickerProps) {
	const foreground = useThemeColor("foreground");
	const accentColor = useThemeColor("muted");
	const initial = value ? new Date(value) : new Date(1990, 0, 1);
	const [date, setDate] = React.useState(initial);
	const [show, setShow] = React.useState(Platform.OS === "ios");

	React.useEffect(() => {
		if (value) {
			const next = new Date(value);
			if (!Number.isNaN(next.getTime())) {
				setDate(next);
			}
		}
	}, [value]);

	const handleChange = (_: unknown, selected?: Date) => {
		if (Platform.OS !== "ios") {
			setShow(false);
		}
		if (!selected) return;
		setDate(selected);
		onChange(selected.toISOString().slice(0, 10));
	};

	return (
		<View className="gap-3">
			{Platform.OS !== "ios" ? (
				<Pressable
					className="border-border/60 rounded-2xl border px-4 py-3"
					onPress={() => setShow(true)}
				>
					<Text className="text-foreground text-base font-semibold">
						{formatDate(date)}
					</Text>
					<Text className="text-muted mt-1 text-xs">
						Tap to select your birth date
					</Text>
				</Pressable>
			) : null}

			{show ? (
				<DateTimePicker
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					value={date}
					minimumDate={MIN_DATE}
					maximumDate={MAX_DATE}
					onChange={handleChange}
					textColor={foreground}
					accentColor={accentColor}
				/>
			) : null}
		</View>
	);
}
