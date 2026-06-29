import { cn } from "heroui-native";
import { ScrollView, View } from "react-native";

import { Checkbox } from "@/components/base/checkbox";

import type { RecapSection } from "./recap-types";

type RecapSectionPickerProps = {
	sections: RecapSection[];
	selectedIds: string[];
	onToggle: (id: string) => void;
	className?: string;
};

export function RecapSectionPicker({
	sections,
	selectedIds,
	onToggle,
	className,
}: RecapSectionPickerProps) {
	return (
		<ScrollView className={cn("gap-4", className)}>
			<View className="gap-3">
				{sections.map((section) => (
					<Checkbox
						key={section.id}
						checked={selectedIds.includes(section.id)}
						onCheckedChange={() => onToggle(section.id)}
						label={section.label}
						description={section.description}
					/>
				))}
			</View>
		</ScrollView>
	);
}
