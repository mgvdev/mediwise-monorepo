import { Ionicons } from "@expo/vector-icons";
import {
	Icon,
	Label,
	NativeTabs,
	VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const themeColorMuted = useThemeColor("muted");
	const themeColorPrimary = useThemeColor("primary");

	return (
		<NativeTabs
			backgroundColor={themeColorBackground}
			iconColor={{
				default: themeColorMuted,
				selected: themeColorPrimary,
			}}
			labelStyle={{
				default: {
					color: themeColorMuted,
					fontWeight: "500",
				},
				selected: {
					color: themeColorPrimary,
					fontWeight: "600",
				},
			}}
			tintColor={themeColorForeground}
			disableTransparentOnScrollEdge
		>
			<NativeTabs.Trigger name="index">
				<Label>Home</Label>
				<Icon src={<VectorIcon family={Ionicons} name="home" />} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="ai">
				<Label>AI Assistant</Label>
				<Icon
					src={<VectorIcon family={Ionicons} name="chatbubble-ellipses" />}
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="documents">
				<Label>Documents</Label>
				<Icon src={<VectorIcon family={Ionicons} name="document-text" />} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="search" role="search">
				<Label>Search</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
