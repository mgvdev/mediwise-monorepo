import { Ionicons } from "@expo/vector-icons";
import { cn, useThemeColor } from "heroui-native";
import * as React from "react";
import type { PressableProps, TextProps, ViewProps } from "react-native";
import { Pressable, Text, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

type SelectableCardProps = PressableProps & {
	selected?: boolean;
	className?: string;
};

export function SelectableCard({
	selected = false,
	className,
	style,
	...props
}: SelectableCardProps) {
	return (
		<Pressable
			className={cn(
				"relative rounded-3xl border border-panel-border bg-panel-background p-6",
				selected && "border-primary bg-primary/5",
				className,
			)}
			style={pressableFeedback(style)}
			{...props}
		/>
	);
}

type SelectableCardIconProps = ViewProps & {
	selected?: boolean;
	iconColor?: string;
	className?: string;
};

export function SelectableCardIcon({
	selected = false,
	iconColor,
	className,
	children,
	...props
}: SelectableCardIconProps) {
	const icon =
		children && React.isValidElement(children)
			? React.cloneElement(children as React.ReactElement<{ color?: string }>, {
					color: iconColor ?? children.props.color,
				})
			: children;

	return (
		<View
			className={cn(
				"mb-5 h-12 w-12 items-center justify-center rounded-full border border-panel-border",
				selected && "border-primary bg-primary/10",
				className,
			)}
			{...props}
		>
			{icon}
		</View>
	);
}

type SelectableCardTitleProps = TextProps & {
	className?: string;
};

export function SelectableCardTitle({
	className,
	...props
}: SelectableCardTitleProps) {
	return (
		<Text
			className={cn("font-semibold text-base text-foreground", className)}
			{...props}
		/>
	);
}

type SelectableCardSubTitleProps = TextProps & {
	className?: string;
};

export function SelectableCardSubTitle({
	className,
	...props
}: SelectableCardSubTitleProps) {
	return <Text className={cn("text-muted text-sm", className)} {...props} />;
}

type SelectableCardActionProps = ViewProps & {
	selected?: boolean;
	className?: string;
};

export function SelectableCardAction({
	selected = false,
	className,
	children,
	...props
}: SelectableCardActionProps) {
	const color = useThemeColor("background");

	return (
		<View className={cn("absolute top-4 right-4", className)} {...props}>
			{children ?? (
				<View
					className={cn(
						"h-7 w-7 items-center justify-center rounded-full border border-panel-border",
						selected && "border-primary bg-primary",
					)}
				>
					{selected ? (
						<Ionicons name="checkmark" size={16} color={color} />
					) : null}
				</View>
			)}
		</View>
	);
}
