import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import type { PressableProps } from "react-native";
import { Pressable, Text, View } from "react-native";

type CheckboxProps = PressableProps & {
	checked: boolean;
	onCheckedChange: (next: boolean) => void;
	label?: string;
	description?: string;
	className?: string;
};

export function Checkbox({
	checked,
	onCheckedChange,
	label,
	description,
	className,
	...props
}: CheckboxProps) {
	return (
		<Pressable
			className={cn("flex-row items-start gap-3", className)}
			onPress={() => onCheckedChange(!checked)}
			accessibilityRole="checkbox"
			accessibilityState={{ checked }}
			{...props}
		>
			<View
				className={cn(
					"h-5 w-5 items-center justify-center rounded border border-panel-border",
					checked && "border-primary bg-primary",
				)}
			>
				{checked ? <Ionicons name="checkmark" size={14} color="white" /> : null}
			</View>
			{label ? (
				<View className="flex-1">
					<Text className="text-foreground text-sm">{label}</Text>
					{description ? (
						<Text className="mt-1 text-muted text-xs">{description}</Text>
					) : null}
				</View>
			) : null}
		</Pressable>
	);
}
