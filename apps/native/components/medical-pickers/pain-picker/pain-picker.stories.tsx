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
		<View className="bg-background flex-1 p-6">
			<PainPicker value={value} onChange={setValue} />
		</View>
	);
};
