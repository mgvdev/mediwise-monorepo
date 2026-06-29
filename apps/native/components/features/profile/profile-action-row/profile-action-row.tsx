import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ProfileActionRowProps = {
	label: string;
	value?: string | null;
	onPress: () => void;
};

export function ProfileActionRow({
	label,
	value,
	onPress,
}: ProfileActionRowProps) {
	return (
		<Pressable
			className="border-border/60 flex-row items-center justify-between rounded-2xl border px-4 py-3"
			onPress={onPress}
		>
			<View className="flex-1">
				<Text className="text-foreground text-sm font-semibold">{label}</Text>
				<Text className="text-muted mt-1 text-xs">
					{value?.trim().length ? value : "Not set"}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} className="text-muted" />
		</Pressable>
	);
}
