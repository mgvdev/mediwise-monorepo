import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	cn,
	Input,
	Label,
	TextField,
	useThemeColor,
} from "heroui-native";
import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

export type PickerOption = {
	value: string;
	label: string;
};

type OptionsPickerProps = {
	options: PickerOption[];
	value: string | null;
	onChange: (next: string) => void;
	label?: string;
	helperText?: string;
	placeholder?: string;
	title?: string;
};

/**
 * Single-choice picker opening a bottom sheet. Used for long option lists where
 * inline radio buttons would not fit (specialties, practitioners).
 */
export function OptionsPicker({
	options,
	value,
	onChange,
	label,
	helperText,
	placeholder = "Select",
	title,
}: OptionsPickerProps) {
	const [open, setOpen] = React.useState(false);
	const accent = useThemeColor("accent");
	const selected = options.find((option) => option.value === value);

	const handleSelect = (next: string) => {
		onChange(next);
		setOpen(false);
	};

	return (
		<View>
			<Pressable onPress={() => setOpen(true)}>
				<TextField>
					{label ? <Label>{label}</Label> : null}
					<Input
						value={selected?.label ?? ""}
						placeholder={placeholder}
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
					<Pressable className="bg-background max-h-[70%] rounded-t-3xl px-6 pt-5 pb-8">
						<View className="gap-4">
							<Text className="text-foreground text-lg font-semibold">
								{title ?? label ?? "Select"}
							</Text>
							<ScrollView className="max-h-80">
								<View className="gap-2">
									{options.map((option) => {
										const isSelected = option.value === value;
										return (
											<Pressable
												key={option.value}
												onPress={() => handleSelect(option.value)}
												className={cn(
													"border-panel-border bg-panel-background flex-row items-center justify-between rounded-2xl border px-4 py-3",
													isSelected && "border-primary bg-primary/10",
												)}
												style={pressableFeedback()}
												accessibilityRole="radio"
												accessibilityState={{ selected: isSelected }}
											>
												<Text
													className={cn(
														"text-muted text-sm",
														isSelected && "text-primary font-semibold",
													)}
												>
													{option.label}
												</Text>
												{isSelected ? (
													<Ionicons name="checkmark" size={16} color={accent} />
												) : null}
											</Pressable>
										);
									})}
								</View>
							</ScrollView>
							<Button variant="secondary" onPress={() => setOpen(false)}>
								<Button.Label>Cancel</Button.Label>
							</Button>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
