import { Ionicons } from "@expo/vector-icons";
import { cn, TextField } from "heroui-native";
import { Text, View } from "react-native";

import {
	Radio,
	RadioComment,
	RadioSelect,
	RadioStart,
} from "@/components/base/radio";

type SexOption = "male" | "female" | "other";

type SexSelectorProps = {
	value: SexOption;
	onChange: (nextValue: SexOption) => void;
	otherDescription?: string;
	onOtherDescriptionChange?: (nextValue: string) => void;
	otherMaxLength?: number;
};

const OPTIONS: Array<{
	value: SexOption;
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
}> = [
	{ value: "male", label: "I am Male", icon: "male-outline" },
	{ value: "female", label: "I am Female", icon: "female-outline" },
	{ value: "other", label: "I am Other", icon: "transgender-outline" },
];

export function SexSelector({
	value,
	onChange,
	otherDescription = "",
	onOtherDescriptionChange,
	otherMaxLength = 30,
}: SexSelectorProps) {
	const handleOtherDescriptionChange =
		onOtherDescriptionChange ?? (() => undefined);

	return (
		<View className="gap-3">
			{OPTIONS.map((option) => {
				const isSelected = value === option.value;
				const showOtherDetails =
					option.value === "other" &&
					(isSelected || otherDescription.length > 0);

				return (
					<Radio
						key={option.value}
						selected={isSelected}
						onPress={() => onChange(option.value)}
					>
						<View className="flex-row items-center justify-between">
							<RadioStart>
								<Ionicons
									name={option.icon}
									size={20}
									className={cn("text-muted", isSelected && "text-primary")}
								/>
								<Text className="font-semibold text-base text-foreground">
									{option.label}
								</Text>
							</RadioStart>
							<RadioSelect selected={isSelected} />
						</View>

						{showOtherDetails ? (
							<RadioComment>
								<TextField>
									<TextField.Label>Describe (optional)</TextField.Label>
									<TextField.Input
										value={otherDescription}
										onChangeText={handleOtherDescriptionChange}
										placeholder="Tell us how you identify"
										maxLength={otherMaxLength}
										multiline
									/>
								</TextField>
								<View className="flex-row items-center justify-between">
									<Text className="text-muted text-xs">
										{otherDescription.length}/{otherMaxLength}
									</Text>
									<Ionicons
										name="pencil-outline"
										size={14}
										className="text-muted"
									/>
								</View>
							</RadioComment>
						) : null}
					</Radio>
				);
			})}
		</View>
	);
}
