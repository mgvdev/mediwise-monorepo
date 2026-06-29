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
	const [showChevron, setShowChevron] = useState(true);
	const [showScore, setShowScore] = useState(true);
	const [showStatus, setShowStatus] = useState(true);
	const [showMember, setShowMember] = useState(true);
	const [showNotifications, setShowNotifications] = useState(true);

	return (
		<ScrollView className="bg-background flex-1 p-6">
			<AppHeader
				title="Home"
				subtitle="Your health snapshot"
				score={showScore ? 88 : null}
				statusLabel={showStatus ? "Healthy" : undefined}
				memberLabel={showMember ? "plus Member" : undefined}
				avatarUri={showAvatar ? avatarUri : undefined}
				notificationCount={showNotifications ? 3 : 0}
				showChevron={showChevron}
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
					checked={showScore}
					onCheckedChange={setShowScore}
					label="Show score ring"
				/>
				<Checkbox
					checked={showStatus}
					onCheckedChange={setShowStatus}
					label="Show status"
				/>
				<Checkbox
					checked={showMember}
					onCheckedChange={setShowMember}
					label="Show member badge"
				/>
				<Checkbox
					checked={showChevron}
					onCheckedChange={setShowChevron}
					label="Show chevron"
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

export const DarkScore = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Home"
			subtitle="Nightingale Score"
			score={88}
			statusLabel="Healthy"
			memberLabel="plus Member"
			avatarUri={avatarUri}
			notificationCount={3}
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
			showChevron={false}
			variant="light"
		/>
	</View>
);

export const GradientMember = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="My health"
			subtitle="Weekly overview"
			score={76}
			statusLabel="Balanced"
			memberLabel="premium"
			avatarUri={avatarUri}
			notificationCount={1}
			variant="gradient"
		/>
	</View>
);

export const SoftFocus = () => (
	<View className="bg-background flex-1 p-6">
		<AppHeader
			title="Vitals"
			subtitle="Morning check-in"
			score={92}
			statusLabel="Great"
			avatarUri={avatarUri}
			variant="soft"
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
