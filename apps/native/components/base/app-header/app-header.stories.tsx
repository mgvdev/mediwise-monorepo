import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Checkbox } from "@/components/base/checkbox";
import { ChoiceInput, type ChoiceValue } from "@/components/base/choice";

import { AppHeader } from "./app-header";

const meta: Meta = {
	title: "Base/AppHeader",
};

export default meta;

const avatarUri =
	"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80";

export const Playground = () => {
	const [variant, setVariant] = useState<ChoiceValue>("dark");
	const [showAvatar, setShowAvatar] = useState(true);
	const [showInsurer, setShowInsurer] = useState(true);
	const [showNotifications, setShowNotifications] = useState(true);

	return (
		<ScrollView className="bg-background flex-1 p-6">
			<AppHeader
				title="Hi, Maxence"
				subtitle="Your health summary"
				insurerName={showInsurer ? "Axa Health" : undefined}
				avatarUri={showAvatar ? avatarUri : undefined}
				notificationCount={showNotifications ? 3 : 0}
				variant={(variant as "dark") || "dark"}
			/>

			<View className="mt-6 gap-4">
				<ChoiceInput
					label="Variant"
					value={variant}
					onChange={(next) => setVariant(next)}
					options={[
						{ label: "Dark", value: "dark" },
						{ label: "Light", value: "light" },
						{ label: "Gradient", value: "gradient" },
						{ label: "Soft", value: "soft" },
						{ label: "Outline", value: "outline" },
					]}
					layout="auto"
				/>
				<Checkbox
					checked={showAvatar}
					onCheckedChange={setShowAvatar}
					label="Show avatar"
				/>
				<Checkbox
					checked={showInsurer}
					onCheckedChange={setShowInsurer}
					label="Show insurer line"
				/>
				<Checkbox
					checked={showNotifications}
					onCheckedChange={setShowNotifications}
					label="Show notifications"
				/>
			</View>
		</ScrollView>
	);
};

export const DarkWithInsurer = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Hi, Maxence"
			subtitle="Your health summary"
			insurerName="Axa Health"
			avatarUri={avatarUri}
			notificationCount={3}
			variant="dark"
		/>
	</View>
);

export const DarkNoInsurer = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Hi, Maxence"
			subtitle="Your health summary"
			avatarUri={avatarUri}
			notificationCount={0}
			variant="dark"
		/>
	</View>
);

export const LightMinimal = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Good afternoon"
			subtitle="Your tasks are up to date"
			avatarUri={avatarUri}
			notificationCount={0}
			variant="light"
		/>
	</View>
);

export const GradientInsurer = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="My health"
			subtitle="Weekly overview"
			insurerName="Blue Shield"
			avatarUri={avatarUri}
			notificationCount={1}
			variant="gradient"
		/>
	</View>
);

export const OutlineCompact = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Documents"
			subtitle="Updated today"
			avatarUri={avatarUri}
			showChevron
			notificationCount={2}
			variant="outline"
		/>
	</View>
);
