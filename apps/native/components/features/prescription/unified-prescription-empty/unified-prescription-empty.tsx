import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";

import { BodyMedium, Caption } from "@/components/base/typography";
import { applyOpacity } from "@/components/utils";

type UnifiedPrescriptionEmptyProps = {
	title?: string;
	description?: string;
	className?: string;
};

export function UnifiedPrescriptionEmpty({
	title = "No unified prescriptions yet",
	description = "Upload a prescription to build your unified medication list.",
	className,
}: UnifiedPrescriptionEmptyProps) {
	const accent = useThemeColor("primary");
	const border = applyOpacity(accent, 0.28) ?? accent;
	const fill = applyOpacity(accent, 0.12) ?? accent;

	return (
		<View
			className={className}
			style={{
				borderWidth: 1,
				borderStyle: "dashed",
				borderRadius: 16,
				borderColor: border,
				backgroundColor: fill,
				paddingVertical: 20,
				paddingHorizontal: 16,
				alignItems: "center",
			}}
		>
			<View
				style={{
					borderWidth: 1,
					borderColor: border,
					backgroundColor: applyOpacity(accent, 0.18) ?? accent,
					borderRadius: 999,
					padding: 10,
				}}
			>
				<Ionicons name="leaf-outline" size={20} color={accent} />
			</View>
			<BodyMedium className="mt-3 text-center text-foreground">
				{title}
			</BodyMedium>
			<Caption className="mt-1 text-center text-muted">{description}</Caption>
		</View>
	);
}
