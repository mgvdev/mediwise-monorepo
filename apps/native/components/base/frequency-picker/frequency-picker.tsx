import { cn } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

export type FrequencyUnit = "day" | "week" | "month";

export type FrequencyValue = {
	frequency: number;
	frequencyUnit: FrequencyUnit;
};

type FrequencyPickerProps = {
	value: FrequencyValue;
	onChange: (next: FrequencyValue) => void;
	label?: string;
	className?: string;
	isEditable?: boolean;
};

const UNITS: FrequencyUnit[] = ["day", "week", "month"];

export function FrequencyPicker({
	value,
	onChange,
	label = "Frequency",
	className,
	isEditable = true,
}: FrequencyPickerProps) {
	const handleChangeCount = (next: string) => {
		const numeric = Number.parseInt(next, 10);
		if (Number.isNaN(numeric)) {
			onChange({ ...value, frequency: 0 });
			return;
		}
		onChange({ ...value, frequency: Math.max(0, numeric) });
	};

	return (
		<View className={cn("gap-3", className)}>
			<Text className="text-muted text-xs">{label}</Text>
			<View className="flex-row items-start gap-3">
				<View className="flex-1">
					<View className="relative rounded-2xl border border-panel-border bg-panel-background px-4 py-3">
						<TextInput
							value={String(value.frequency ?? 0)}
							onChangeText={handleChangeCount}
							keyboardType="number-pad"
							className="pr-8 text-foreground"
							placeholder="0"
							editable={isEditable}
						/>
						<Text className="absolute top-3 right-4 text-muted text-xs">
							per
						</Text>
					</View>
				</View>
				<View className="flex-1 gap-2">
					{UNITS.map((unit) => {
						const selected = unit === value.frequencyUnit;
						return (
							<Pressable
								key={unit}
								onPress={() => {
									if (!isEditable) return;
									onChange({ ...value, frequencyUnit: unit });
								}}
								className={cn(
									"items-center rounded-full border border-panel-border px-3 py-2",
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
