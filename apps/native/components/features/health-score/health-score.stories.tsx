import type { Meta } from "@storybook/react-native";
import { ScrollView, View } from "react-native";

import { HealthScore } from "./health-score";

const meta: Meta = {
	title: "Medical/HealthScore",
};

export default meta;

export const Default = () => (
	<View className="flex-1 bg-background p-6">
		<HealthScore
			score={88}
			updatedLabel="Last updated: 3s ago"
			summary="You are a very healthy individual. There’s still room for improvement."
		/>
	</View>
);

export const Variants = () => (
	<ScrollView className="flex-1 bg-background p-6">
		<View className="gap-10">
			<HealthScore
				score={92}
				updatedLabel="Updated today"
				summary="Optimal health."
			/>
			<HealthScore
				score={58}
				updatedLabel="Updated today"
				summary="Average health."
			/>
			<HealthScore
				score={22}
				updatedLabel="Updated today"
				summary="Needs attention."
			/>
		</View>
	</ScrollView>
);
