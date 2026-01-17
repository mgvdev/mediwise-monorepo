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
			className="flex-row items-center justify-between rounded-2xl border border-border/60 px-4 py-3"
			onPress={onPress}
		>
			<View className="flex-1">
				<Text className="font-semibold text-foreground text-sm">{label}</Text>
				<Text className="mt-1 text-muted text-xs">
					{value?.trim().length ? value : "Not set"}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} className="text-muted" />
		</Pressable>
	);
}
