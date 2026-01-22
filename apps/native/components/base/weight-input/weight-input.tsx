import { BottomSheet, Button, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { H3 } from "@/components/base/typography";
import { WeightPicker } from "@/components/medical-pickers/weight-picker";

type WeightInputProps = {
	label: string;
	valueLabel: string;
	pickerValue: number;
	pickerUnit: "kg" | "lbs";
	onPickerChange: (nextValue: number, nextUnit: "kg" | "lbs") => void;
	onConfirm: () => void;
	onOpen?: () => void;
	snapPoints?: number[];
};

export function WeightInput({
	label,
	valueLabel,
	pickerValue,
	pickerUnit,
	onPickerChange,
	onConfirm,
	onOpen,
	snapPoints = [440],
}: WeightInputProps) {
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
						<TextField.Label>{label}</TextField.Label>
						<TextField.Input
							value={valueLabel}
							editable={false}
							pointerEvents="none"
						/>
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
						<H3>Select your weight</H3>
						<WeightPicker
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
