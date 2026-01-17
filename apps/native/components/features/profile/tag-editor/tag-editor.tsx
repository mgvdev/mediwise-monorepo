import { Ionicons } from "@expo/vector-icons";
import { Button, Chip, TextField } from "heroui-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

type TagEditorProps = {
	label: string;
	placeholder?: string;
	value: string[];
	onChange: (next: string[]) => void;
};

export function TagEditor({
	label,
	placeholder,
	value,
	onChange,
}: TagEditorProps) {
	const [input, setInput] = React.useState("");

	const addTag = () => {
		const trimmed = input.trim();
		if (!trimmed) return;
		if (value.includes(trimmed)) {
			setInput("");
			return;
		}
		onChange([...value, trimmed]);
		setInput("");
	};

	const removeTag = (tag: string) => {
		onChange(value.filter((item) => item !== tag));
	};

	return (
		<View className="gap-3">
			<Text className="font-semibold text-base text-foreground">{label}</Text>
			<View className="flex-row items-end gap-3">
				<View className="flex-1">
					<TextField>
						<TextField.Label>Add item</TextField.Label>
						<TextField.Input
							value={input}
							onChangeText={setInput}
							placeholder={placeholder}
							returnKeyType="done"
							onSubmitEditing={addTag}
						/>
					</TextField>
				</View>
				<Button size="sm" onPress={addTag}>
					<Button.Label>Add</Button.Label>
				</Button>
			</View>
			<View className="flex-row flex-wrap gap-1">
				{value.length ? (
					value.map((tag) => (
						<Pressable key={tag} onPress={() => removeTag(tag)}>
							<Chip className="text-foreground text-xs">
								<Chip.Label>{tag}</Chip.Label>
								<Ionicons name="close" size={12} className="ml-1 text-muted" />
							</Chip>
						</Pressable>
					))
				) : (
					<Text className="text-muted text-xs">No items yet.</Text>
				)}
			</View>
		</View>
	);
}
