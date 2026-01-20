import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import { FrequencyPicker, type FrequencyValue } from "./frequency-picker";

const meta: Meta = {
	title: "Base/FrequencyPicker",
};

export default meta;

export const Default = () => {
	const [value, setValue] = useState<FrequencyValue>({
		frequency: 1,
		frequencyUnit: "day",
	});

	return (
		<View className="flex-1 bg-background p-6">
			<FrequencyPicker value={value} onChange={setValue} />
		</View>
	);
};
