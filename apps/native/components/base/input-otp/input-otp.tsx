import { cn } from "heroui-native";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type InputOtpProps = {
	value: string;
	onChange: (next: string) => void;
	length?: number;
	autoFocus?: boolean;
	isDisabled?: boolean;
	onComplete?: (value: string) => void;
	className?: string;
	cellClassName?: string;
} & Omit<ComponentProps<typeof TextInput>, "value" | "onChangeText">;

const DEFAULT_LENGTH = 6;

export function InputOtp({
	value,
	onChange,
	length = DEFAULT_LENGTH,
	autoFocus = false,
	isDisabled = false,
	onComplete,
	className,
	cellClassName,
	...textInputProps
}: InputOtpProps) {
	const inputRef = useRef<TextInput>(null);
	const cells = useMemo(
		() =>
			Array.from({ length }, (_, position) => ({
				id: `otp-cell-${length}-${position}`,
				position,
			})),
		[length],
	);

	const handleChange = useCallback(
		(nextValue: string) => {
			const cleaned = nextValue.replace(/\D/g, "").slice(0, length);
			onChange(cleaned);
			if (cleaned.length === length) {
				onComplete?.(cleaned);
			}
		},
		[length, onChange, onComplete],
	);

	return (
		<Pressable
			onPress={() => inputRef.current?.focus()}
			className={cn("relative", className)}
			accessibilityRole="button"
			accessibilityLabel="One-time code input"
			disabled={isDisabled}
		>
			<View className="flex-row items-center gap-2">
				{cells.map((cell) => {
					const digit = value[cell.position] ?? "";
					const isActive = cell.position === Math.min(value.length, length - 1);
					return (
						<View
							key={cell.id}
							className={cn(
								"h-12 w-12 items-center justify-center rounded-xl border bg-panel-background",
								isActive ? "border-primary" : "border-panel-border",
								isDisabled && "opacity-60",
								cellClassName,
							)}
						>
							<Text className="font-semibold text-foreground text-lg">
								{digit}
							</Text>
						</View>
					);
				})}
			</View>
			<TextInput
				ref={inputRef}
				value={value}
				onChangeText={handleChange}
				maxLength={length}
				autoFocus={autoFocus}
				editable={!isDisabled}
				keyboardType="number-pad"
				textContentType="oneTimeCode"
				importantForAutofill="yes"
				selectionColor="transparent"
				className="absolute inset-0 opacity-0"
				{...textInputProps}
			/>
		</Pressable>
	);
}
