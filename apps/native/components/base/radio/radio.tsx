import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import type { PressableProps, ViewProps } from "react-native";
import { Pressable, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

type RadioProps = PressableProps & {
	selected?: boolean;
	className?: string;
};

export function Radio({
	selected = false,
	className,
	style,
	...props
}: RadioProps) {
	return (
		<Pressable
			className={cn(
				"border-panel-border bg-panel-background rounded-2xl border px-4 py-3",
				selected && "border-primary bg-primary/10",
				className,
			)}
			style={pressableFeedback(style)}
			{...props}
		/>
	);
}

export function RadioStart({ className, ...props }: ViewProps) {
	return (
		<View className={cn("flex-row items-center gap-3", className)} {...props} />
	);
}

type RadioSelectProps = ViewProps & {
	selected?: boolean;
};

export function RadioSelect({
	selected = false,
	className,
	...props
}: RadioSelectProps) {
	return (
		<View
			className={cn(
				"border-panel-border h-6 w-6 items-center justify-center rounded-full border",
				selected && "border-primary bg-primary/20",
				className,
			)}
			{...props}
		>
			{selected ? (
				<Ionicons name="checkmark" size={14} className="text-primary" />
			) : null}
		</View>
	);
}

export function RadioComment({ className, ...props }: ViewProps) {
	return <View className={cn("mt-3 gap-2", className)} {...props} />;
}
