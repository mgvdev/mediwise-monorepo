import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import { Checkbox } from "./checkbox";

const meta: Meta = {
	title: "Base/Checkbox",
};

export default meta;

export const Default = () => {
	const [checked, setChecked] = useState(false);

	return (
		<View className="bg-background flex-1 p-6">
			<Checkbox
				checked={checked}
				onCheckedChange={setChecked}
				label="Share medications"
				description="Include current prescriptions and dosages"
			/>
		</View>
	);
};
