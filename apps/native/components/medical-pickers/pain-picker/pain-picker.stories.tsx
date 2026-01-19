import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import { type PainLevel, PainPicker } from "./pain-picker";

const meta: Meta = {
	title: "Medical/PainPicker",
};

export default meta;

export const Default = () => {
	const [value, setValue] = useState<PainLevel>(0);

	return (
		<View className="flex-1 bg-background p-6">
			<PainPicker value={value} onChange={setValue} />
		</View>
	);
};
