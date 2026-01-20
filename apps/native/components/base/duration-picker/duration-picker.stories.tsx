import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import { DurationPicker, type DurationValue } from "./duration-picker";

const meta: Meta = {
	title: "Base/DurationPicker",
};

export default meta;

export const Default = () => {
	const [value, setValue] = useState<DurationValue>({
		duration: 7,
		durationUnit: "day",
	});

	return (
		<View className="flex-1 bg-background p-6">
			<DurationPicker value={value} onChange={setValue} />
		</View>
	);
};
