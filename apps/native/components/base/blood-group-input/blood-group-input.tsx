import {
	Button,
	Dialog,
	Input,
	Label,
	TextField,
	useThemeColor,
} from "heroui-native";
import * as React from "react";
import { Text, View } from "react-native";

const BLOOD_GROUPS = [
	"O-",
	"O+",
	"A-",
	"A+",
	"B-",
	"B+",
	"AB-",
	"AB+",
] as const;

type BloodGroupInputProps = {
	label?: string;
	value?: string | null;
	helperText?: string;
	onChange: (nextValue: string) => void;
};

export function BloodGroupInput({
	label = "Blood group",
	value,
	helperText,
	onChange,
}: BloodGroupInputProps) {
	const muted = useThemeColor("muted");
	const [open, setOpen] = React.useState(false);

	return (
		<Dialog isOpen={open} onOpenChange={setOpen}>
			<Dialog.Trigger>
				<TextField>
					<Label>{label}</Label>
					<Input
						value={value ?? "Select blood group"}
						editable={false}
						pointerEvents="none"
					/>
				</TextField>
				{helperText ? (
					<Text className="text-muted mt-1 text-xs">{helperText}</Text>
				) : null}
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content>
					<View className="mb-4 gap-1">
						<Dialog.Title>{label}</Dialog.Title>
						<Dialog.Description>
							Choose the option that matches your blood group.
						</Dialog.Description>
					</View>
					<View className="flex-row flex-wrap gap-3">
						{BLOOD_GROUPS.map((group) => {
							const isSelected = group === value;
							return (
								<Button
									key={group}
									variant={isSelected ? "primary" : "secondary"}
									className="min-w-[84px]"
									onPress={() => onChange(group)}
								>
									<Button.Label>{group}</Button.Label>
								</Button>
							);
						})}
					</View>
					<View className="mt-5 flex-row justify-end">
						<Button variant="primary" size="sm" onPress={() => setOpen(false)}>
							<Button.Label>Done</Button.Label>
						</Button>
					</View>
					<Text className="text-muted mt-3 text-xs" style={{ color: muted }}>
						Tip: You can update this later if you are unsure.
					</Text>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
