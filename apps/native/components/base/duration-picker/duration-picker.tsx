import { cn } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

export type DurationUnit = "day" | "week" | "month";

export type DurationValue = {
	duration: number;
	durationUnit: DurationUnit;
};

type DurationPickerProps = {
	value: DurationValue;
	onChange: (next: DurationValue) => void;
	label?: string;
	className?: string;
	isEditable?: boolean;
};

const UNITS: DurationUnit[] = ["day", "week", "month"];

export function DurationPicker({
	value,
	onChange,
	label = "Duration",
	className,
	isEditable = true,
}: DurationPickerProps) {
	const handleChangeCount = (next: string) => {
		const numeric = Number.parseInt(next, 10);
		if (Number.isNaN(numeric)) {
			onChange({ ...value, duration: 0 });
			return;
		}
		onChange({ ...value, duration: Math.max(0, numeric) });
	};

	return (
		<View className={cn("gap-3", className)}>
			<Text className="text-muted text-xs">{label}</Text>
			<View className="flex-row items-start gap-3">
				<View className="flex-1">
					<View className="border-panel-border bg-panel-background relative rounded-2xl border px-4 py-3">
						<TextInput
							value={String(value.duration ?? 0)}
							onChangeText={handleChangeCount}
							keyboardType="number-pad"
							className="text-foreground pr-10"
							placeholder="0"
							editable={isEditable}
						/>
						<Text className="text-muted absolute top-3 right-4 text-xs">
							for
						</Text>
					</View>
				</View>
				<View className="flex-1 gap-2">
					{UNITS.map((unit) => {
						const selected = unit === value.durationUnit;
						return (
							<Pressable
								key={unit}
								onPress={() => {
									if (!isEditable) return;
									onChange({ ...value, durationUnit: unit });
								}}
								className={cn(
									"border-panel-border items-center rounded-full border px-3 py-2",
									selected && "border-primary bg-primary/10",
									!isEditable && "opacity-60",
								)}
								style={pressableFeedback(undefined, {
									disabled: !isEditable,
								})}
							>
								<Text
									className={cn(
										"text-muted text-sm",
										selected && "text-primary",
									)}
								>
									{unit}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
}
