import type { Meta } from "@storybook/react-native";
import { ScrollView, Text, View } from "react-native";

import { MEDICATION_SHAPE_GROUPS, MedicationShape } from "./medication-shape";

const meta: Meta = {
	title: "Prescription/MedicationShape",
};

export default meta;

export const Gallery = () => (
	<ScrollView className="bg-background flex-1 p-6">
		<View className="gap-6">
			{MEDICATION_SHAPE_GROUPS.map((group) => (
				<View key={group.title} className="gap-3">
					<Text className="text-foreground text-sm font-semibold">
						{group.title}
					</Text>
					<View className="flex-row flex-wrap gap-4">
						{group.items.map((shape) => (
							<MedicationShape key={shape} shape={shape} />
						))}
					</View>
				</View>
			))}
		</View>
	</ScrollView>
);
