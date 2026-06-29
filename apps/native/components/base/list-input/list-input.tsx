import { Ionicons } from "@expo/vector-icons";
import { cn, Input, Label, TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

type ListInputProps = {
	value: string[];
	onChange: (next: string[]) => void;
	label?: string;
	placeholder?: string;
	helperText?: string;
	emptyText?: string;
	className?: string;
};

export function ListInput({
	value,
	onChange,
	label,
	placeholder = "Add item",
	helperText,
	emptyText = "No items yet.",
	className,
}: ListInputProps) {
	const [input, setInput] = React.useState("");
	const muted = useThemeColor("muted");

	const handleAdd = React.useCallback(() => {
		const trimmed = input.trim();
		if (!trimmed) return;
		onChange([...value, trimmed]);
		setInput("");
	}, [input, onChange, value]);

	const handleRemove = React.useCallback(
		(index: number) => {
			onChange(value.filter((_, itemIndex) => itemIndex !== index));
		},
		[onChange, value],
	);

	return (
		<View className={cn("gap-3", className)}>
			<TextField>
				{label ? <Label>{label}</Label> : null}
				<View className="flex-row items-center gap-2">
					<View className="flex-1">
						<Input
							value={input}
							onChangeText={setInput}
							placeholder={placeholder}
							returnKeyType="done"
							onSubmitEditing={handleAdd}
						/>
					</View>
					<Pressable
						onPress={handleAdd}
						className="border-panel-border items-center justify-center rounded-full border px-3 py-2"
						style={pressableFeedback()}
						accessibilityRole="button"
						accessibilityLabel="Add item"
					>
						<Ionicons name="add" size={16} color={muted} />
					</Pressable>
				</View>
			</TextField>
			{value.length ? (
				<View className="gap-2">
					{value.map((item, index) => (
						<View
							key={`${item}`}
							className="border-panel-border bg-panel-background flex-row items-center justify-between rounded-2xl border px-4 py-3"
						>
							<Text className="text-foreground flex-1 text-sm">{item}</Text>
							<Pressable
								onPress={() => handleRemove(index)}
								className="border-panel-border ml-3 h-8 w-8 items-center justify-center rounded-full border bg-white/70"
								style={pressableFeedback()}
								accessibilityRole="button"
								accessibilityLabel={`Remove ${item}`}
							>
								<Ionicons name="close" size={14} color={muted} />
							</Pressable>
						</View>
					))}
				</View>
			) : (
				<Text className="text-muted text-xs">{emptyText}</Text>
			)}
			{helperText ? (
				<Text className="text-muted text-xs">{helperText}</Text>
			) : null}
		</View>
	);
}
