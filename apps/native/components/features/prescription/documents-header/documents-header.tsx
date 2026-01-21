import { Ionicons } from "@expo/vector-icons";
import { cn, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/base/card";
import { Link } from "@/components/base/typography";
import {
	applyOpacity,
	getRelativeLuminance,
	pressableFeedback,
} from "@/components/utils";

type DocumentsHeaderProps = {
	onPickFromLibrary: () => void;
	onTakePhoto: () => void;
	onAddManual: () => void;
	className?: string;
};

type ActionTileProps = {
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
	accent: string;
	labelColor: string;
	onPress: () => void;
};

function ActionTile({
	label,
	icon,
	accent,
	labelColor,
	onPress,
}: ActionTileProps) {
	const accentBackground = applyOpacity(accent, 0.12);
	return (
		<Pressable
			onPress={onPress}
			className="flex-1"
			style={pressableFeedback([
				{ borderColor: accent },
				accentBackground ? { backgroundColor: accentBackground } : null,
				styles.actionTile,
			])}
		>
			<Ionicons name={icon} size={22} color={accent} />
			<Text
				className="mt-2 text-center font-semibold text-base"
				style={{ color: labelColor }}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export function DocumentsHeader({
	onPickFromLibrary,
	onTakePhoto,
	onAddManual,
	className,
}: DocumentsHeaderProps) {
	const baseBackground = useThemeColor("background");
	const baseForeground = useThemeColor("foreground");
	const accentUpload = useThemeColor("success");
	const accentScan = useThemeColor("warning");

	const headerBackground = baseForeground;
	const headerText = baseBackground;
	const headerMuted = applyOpacity(headerText, 0.7) ?? headerText;
	const luminance = getRelativeLuminance(headerBackground);
	const iconTint =
		luminance !== null && luminance > 0.5 ? headerMuted : headerText;

	return (
		<Card className={cn("gap-4 p-5", className)} variant="inverse">
			<View className="flex-row gap-3">
				<ActionTile
					label="Upload Prescription"
					icon="cloud-upload-outline"
					accent={accentUpload}
					labelColor={headerText}
					onPress={onPickFromLibrary}
				/>
				<ActionTile
					label="Scan Prescription"
					icon="camera-outline"
					accent={accentScan}
					labelColor={headerText}
					onPress={onTakePhoto}
				/>
			</View>
			<Pressable
				onPress={onAddManual}
				className="flex-row items-center gap-1 self-start"
				style={pressableFeedback()}
			>
				<Ionicons name="add" size={16} color={iconTint} />
				<Link className="text-xs" style={{ color: iconTint }}>
					Add a prescription manually
				</Link>
			</Pressable>
		</Card>
	);
}

const styles = {
	actionTile: {
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 18,
		paddingVertical: 16,
		paddingHorizontal: 12,
		alignItems: "center",
		justifyContent: "center",
	},
};
