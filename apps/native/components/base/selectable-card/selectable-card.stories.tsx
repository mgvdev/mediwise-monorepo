import { Ionicons } from "@expo/vector-icons";
import type { Meta } from "@storybook/react-native";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";
import {
	SelectableCard,
	SelectableCardAction,
	SelectableCardIcon,
	SelectableCardSubTitle,
	SelectableCardTitle,
} from "./selectable-card";

const meta: Meta = {
	title: "Base/SelectableCard",
};

export default meta;

export const Default = () => {
	const color = useThemeColor("background-inverse");

	return (
		<View className="flex-1 bg-background p-6">
			<SelectableCard>
				<SelectableCardIcon iconColor={color}>
					<Ionicons name="leaf-outline" size={22} />
				</SelectableCardIcon>
				<SelectableCardTitle>Title</SelectableCardTitle>
				<SelectableCardSubTitle>Supporting text</SelectableCardSubTitle>
				<SelectableCardAction />
			</SelectableCard>
		</View>
	);
};

export const Selected = () => {
	const color = useThemeColor("background-inverse");

	return (
		<View className="flex-1 bg-background p-6">
			<SelectableCard selected>
				<SelectableCardIcon selected iconColor={color}>
					<Ionicons name="leaf-outline" size={22} />
				</SelectableCardIcon>
				<SelectableCardTitle>Title</SelectableCardTitle>
				<SelectableCardSubTitle>Supporting text</SelectableCardSubTitle>
				<SelectableCardAction selected />
			</SelectableCard>
		</View>
	);
};
