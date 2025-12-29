import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Surface, useThemeColor } from "heroui-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { applyOpacity, getRelativeLuminance } from "@/components/color-utils";

type DocumentsHeaderProps = {
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	onPickFromLibrary: () => void;
	onTakePhoto: () => void;
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
			style={({ pressed }) => [
				{ opacity: pressed ? 0.9 : 1, borderColor: accent },
				accentBackground ? { backgroundColor: accentBackground } : null,
				styles.actionTile,
			]}
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
	searchQuery,
	onSearchQueryChange,
	onPickFromLibrary,
	onTakePhoto,
}: DocumentsHeaderProps) {
	const insets = useSafeAreaInsets();
	const baseBackground = useThemeColor("background");
	const baseForeground = useThemeColor("foreground");
	const accentUpload = useThemeColor("success");
	const accentScan = useThemeColor("warning");
	const muted = useThemeColor("muted");

	const headerBackground = baseForeground;
	const headerText = baseBackground;
	const headerMuted = applyOpacity(headerText, 0.7) ?? headerText;
	const searchPlaceholder = applyOpacity(baseForeground, 0.4) ?? muted;
	const luminance = getRelativeLuminance(headerBackground);
	const statusBarStyle =
		luminance !== null && luminance > 0.5 ? "dark" : "light";

	return (
		<>
			<StatusBar style={statusBarStyle} backgroundColor={headerBackground} />
			<Surface
				variant="secondary"
				className="rounded-b-3xl"
				style={{
					paddingTop: insets.top,
					backgroundColor: headerBackground,
				}}
			>
				<View className="px-6 pt-4 pb-5">
					<View className="mb-3 flex-row gap-3">
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
					<View
						className="flex-row items-center gap-2 rounded-full px-3 py-2"
						style={{
							backgroundColor: baseBackground,
							borderWidth: 1,
							borderColor: applyOpacity(baseForeground, 0.12) ?? baseForeground,
						}}
					>
						<Ionicons name="search" size={18} color={searchPlaceholder} />
						<TextInput
							value={searchQuery}
							onChangeText={onSearchQueryChange}
							placeholder="Search E-Pharmacy"
							placeholderTextColor={searchPlaceholder}
							className="flex-1 text-sm"
							style={{ color: baseForeground }}
						/>
					</View>
					<Text className="mt-3 text-xs" style={{ color: headerMuted }}>
						Upload or scan prescriptions to build the unified record.
					</Text>
				</View>
			</Surface>
		</>
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
