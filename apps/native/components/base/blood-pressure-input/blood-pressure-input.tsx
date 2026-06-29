import { BottomSheet, Button, Input, Label, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { H3 } from "@/components/base/typography";
import { BloodPressurePicker } from "@/components/medical-pickers/blood-pressure-picker";

type BloodPressureInputProps = {
	label?: string;
	value?: string | null;
	helperText?: string;
	onChange: (nextValue: string) => void;
};

const DEFAULT_SYSTOLIC = 120;
const DEFAULT_DIASTOLIC = 80;

// Value is stored as a single "systolic/diastolic" string (e.g. "120/80").
function parseValue(value?: string | null) {
	if (!value) return null;
	const [rawSys, rawDia] = value.split("/");
	const systolic = Number.parseInt(rawSys ?? "", 10);
	const diastolic = Number.parseInt(rawDia ?? "", 10);
	if (Number.isNaN(systolic) || Number.isNaN(diastolic)) return null;
	return { systolic, diastolic };
}

export function BloodPressureInput({
	label = "Blood pressure",
	value,
	helperText,
	onChange,
}: BloodPressureInputProps) {
	const [open, setOpen] = React.useState(false);
	const [systolic, setSystolic] = React.useState(DEFAULT_SYSTOLIC);
	const [diastolic, setDiastolic] = React.useState(DEFAULT_DIASTOLIC);

	const parsed = parseValue(value);
	const valueLabel = parsed
		? `${parsed.systolic} / ${parsed.diastolic} mmHg`
		: "Add blood pressure";

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			const current = parseValue(value);
			setSystolic(current?.systolic ?? DEFAULT_SYSTOLIC);
			setDiastolic(current?.diastolic ?? DEFAULT_DIASTOLIC);
		}
		setOpen(nextOpen);
	};

	const handleSave = () => {
		onChange(`${systolic}/${diastolic}`);
		setOpen(false);
	};

	return (
		<BottomSheet isOpen={open} onOpenChange={handleOpenChange}>
			<BottomSheet.Trigger asChild>
				<Pressable>
					<TextField>
						<Label>{label}</Label>
						<Input value={valueLabel} editable={false} pointerEvents="none" />
					</TextField>
					{helperText ? (
						<Text className="text-muted mt-1 text-xs">{helperText}</Text>
					) : null}
				</Pressable>
			</BottomSheet.Trigger>
			<BottomSheet.Portal>
				<BottomSheet.Overlay />
				<BottomSheet.Content
					snapPoints={[620]}
					enablePanDownToClose
					contentContainerClassName="px-5 pt-4"
				>
					<View className="gap-4">
						<H3>Blood pressure</H3>
						<BloodPressurePicker
							systolic={systolic}
							diastolic={diastolic}
							onChange={(nextSys, nextDia) => {
								setSystolic(nextSys);
								setDiastolic(nextDia);
							}}
						/>
						<View className="flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1"
								onPress={() => setOpen(false)}
							>
								<Button.Label>Cancel</Button.Label>
							</Button>
							<Button className="flex-1" onPress={handleSave}>
								<Button.Label>Save</Button.Label>
							</Button>
						</View>
					</View>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
