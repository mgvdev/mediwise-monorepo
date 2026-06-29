import { cn } from "heroui-native";
import type { ViewProps } from "react-native";
import { Text, View } from "react-native";

export type DotChipStatus = "normal" | "warning" | "danger";

type DotChipProps = ViewProps & {
	status: DotChipStatus;
	label: string;
};

const STATUS_STYLES: Record<
	DotChipStatus,
	{ container: string; dot: string; text: string }
> = {
	normal: {
		container: "border-success/30 bg-success/10",
		dot: "bg-success",
		text: "text-success",
	},
	warning: {
		container: "border-warning/30 bg-warning/10",
		dot: "bg-warning",
		text: "text-warning",
	},
	danger: {
		container: "border-danger/30 bg-danger/10",
		dot: "bg-danger",
		text: "text-danger",
	},
};

export function DotChip({ status, label, className, ...props }: DotChipProps) {
	const styles = STATUS_STYLES[status];

	return (
		<View
			className={cn(
				"flex-row items-center gap-2 rounded-full border px-3 py-1",
				styles.container,
				className,
			)}
			{...props}
		>
			<View className={cn("h-2 w-2 rounded-full", styles.dot)} />
			<Text className={cn("text-xs font-medium", styles.text)}>{label}</Text>
		</View>
	);
}
