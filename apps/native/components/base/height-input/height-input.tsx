import { BottomSheet, Button, Input, Label, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { H3 } from "@/components/base/typography";
import { HeightPicker } from "@/components/medical-pickers/height-picker";

type HeightInputProps = {
	label: string;
	valueLabel: string;
	pickerValue: number;
	pickerUnit: "cm" | "inch";
	onPickerChange: (nextValue: number, nextUnit: "cm" | "inch") => void;
	onConfirm: () => void;
	onOpen?: () => void;
	snapPoints?: number[];
};

export function HeightInput({
	label,
	valueLabel,
	pickerValue,
	pickerUnit,
	onPickerChange,
	onConfirm,
	onOpen,
	snapPoints = [680],
}: HeightInputProps) {
	const [open, setOpen] = React.useState(false);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			onOpen?.();
		}
		setOpen(nextOpen);
	};

	const handleConfirm = () => {
		onConfirm();
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
				</Pressable>
			</BottomSheet.Trigger>
			<BottomSheet.Portal>
				<BottomSheet.Overlay />
				<BottomSheet.Content
					snapPoints={snapPoints}
					enablePanDownToClose
					contentContainerClassName="px-5 pt-4"
				>
					<View className="gap-4">
						<H3>Select your height</H3>
						<HeightPicker
							value={pickerValue}
							unit={pickerUnit}
							onChange={onPickerChange}
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
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
