import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Surface, useThemeColor } from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { SafeAreaSheet } from "@/components/base/safe-area-sheet";
import { Caption, H3 } from "@/components/base/typography";

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
		<>
			<Pressable
				className="rounded-2xl border border-border/60 px-4 py-3"
				onPress={() => setOpen(true)}
			>
				<Text className="font-semibold text-base text-foreground">
					{formatDate(value ? new Date(value) : null)}
				</Text>
				{helperText ? (
					<Text className="mt-1 text-muted text-xs">{helperText}</Text>
				) : null}
			</Pressable>
			<SafeAreaSheet
				visible={open}
				onClose={() => setOpen(false)}
				maxHeight={360}
				presentationStyle="overFullScreen"
				contentStyle={{ height: 380 }}
			>
				<Surface variant="secondary" className="rounded-3xl p-5">
					<View className="gap-4">
						<H3>{label ?? "Select date"}</H3>
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
						{helperText ? <Caption>{helperText}</Caption> : null}
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
				</Surface>
			</SafeAreaSheet>
		</>
	);
}
