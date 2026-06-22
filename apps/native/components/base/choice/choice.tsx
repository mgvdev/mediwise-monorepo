import { Ionicons } from "@expo/vector-icons";
import { cn, Input, Label, TextField } from "heroui-native";
import type {
	PressableProps,
	TextInputProps,
	TextProps,
	ViewProps,
} from "react-native";
import { Pressable, Text, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

export type ChoiceValue = string | null;
export type ChoiceLayout = "horizontal" | "vertical" | "auto";

export type ChoiceOption = {
	value: string;
	label: string;
};

type ChoiceInputProps = ViewProps & {
	value: ChoiceValue;
	onChange: (next: ChoiceValue) => void;
	options: ChoiceOption[];
	label?: string;
	description?: string;
	layout?: ChoiceLayout;
};

export function ChoiceInput({
	value,
	onChange,
	options,
	label,
	description,
	layout = "auto",
	className,
	...props
}: ChoiceInputProps) {
	const resolvedLayout =
		layout === "auto"
			? options.length > 2 || options.some((option) => option.label.length > 10)
				? "vertical"
				: "horizontal"
			: layout;

	return (
		<View className={cn("gap-3", className)} {...props}>
			{label ? (
				<Text className="font-semibold text-base text-foreground">{label}</Text>
			) : null}
			{description ? (
				<Text className="text-muted text-xs">{description}</Text>
			) : null}
			<ChoiceOptions layout={resolvedLayout}>
				{options.map((option) => (
					<ChoiceOption
						key={option.value}
						label={option.label}
						selected={value === option.value}
						onPress={() => onChange(option.value)}
						layout={resolvedLayout}
					/>
				))}
			</ChoiceOptions>
		</View>
	);
}

type ChoiceOptionsProps = ViewProps & {
	className?: string;
	layout?: ChoiceLayout;
};

export function ChoiceOptions({
	className,
	layout = "horizontal",
	...props
}: ChoiceOptionsProps) {
	return (
		<View
			className={cn(
				"gap-3",
				layout === "vertical" ? "flex-col" : "flex-row flex-wrap",
				className,
			)}
			{...props}
		/>
	);
}

type ChoiceOptionProps = PressableProps & {
	selected?: boolean;
	label: string;
	layout?: ChoiceLayout;
};

export function ChoiceOption({
	selected = false,
	label,
	layout = "horizontal",
	className,
	style,
	...props
}: ChoiceOptionProps) {
	return (
		<Pressable
			className={cn(
				"flex-row items-center gap-3 rounded-2xl border border-panel-border bg-panel-background px-4 py-3",
				layout === "horizontal" ? "flex-1" : "w-full",
				selected && "border-primary bg-primary/10",
				className,
			)}
			accessibilityRole="radio"
			accessibilityState={{ selected }}
			style={pressableFeedback(style)}
			{...props}
		>
			<ChoiceIndicator selected={selected} />
			<Text
				className={cn(
					"text-muted text-sm",
					selected && "font-semibold text-primary",
				)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

type ChoiceIndicatorProps = ViewProps & {
	selected?: boolean;
};

export function ChoiceIndicator({
	selected = false,
	className,
	...props
}: ChoiceIndicatorProps) {
	return (
		<View
			className={cn(
				"h-5 w-5 items-center justify-center rounded-full border border-panel-border",
				selected && "border-primary bg-primary/20",
				className,
			)}
			{...props}
		>
			{selected ? (
				<Ionicons name="checkmark" size={12} className="text-primary" />
			) : null}
		</View>
	);
}

type ChoiceCommentProps = Omit<TextInputProps, "onChangeText" | "value"> & {
	value: string;
	onChangeText: (next: string) => void;
	label?: string;
	helperText?: string;
	className?: string;
};

export function ChoiceComment({
	value,
	onChangeText,
	label = "Comment",
	helperText,
	className,
	multiline,
	numberOfLines,
	...props
}: ChoiceCommentProps) {
	const isMultiline = multiline ?? true;
	const resolvedLines = numberOfLines ?? (isMultiline ? 3 : undefined);

	return (
		<View className={cn("gap-2", className)}>
			<TextField>
				{label ? <Label>{label}</Label> : null}
				<Input
					value={value}
					onChangeText={onChangeText}
					multiline={isMultiline}
					numberOfLines={resolvedLines}
					{...props}
				/>
			</TextField>
			{helperText ? (
				<Text className="text-muted text-xs">{helperText}</Text>
			) : null}
		</View>
	);
}

type ChoiceLabelProps = TextProps & {
	className?: string;
};

export function ChoiceLabel({ className, ...props }: ChoiceLabelProps) {
	return (
		<Text
			className={cn("font-semibold text-base text-foreground", className)}
			{...props}
		/>
	);
}
