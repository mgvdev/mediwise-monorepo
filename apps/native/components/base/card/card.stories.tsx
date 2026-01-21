import { Ionicons } from "@expo/vector-icons";
import type { Meta } from "@storybook/react-native";
import { Text, View } from "react-native";

import {
	Card,
	CardAction,
	CardBody,
	CardFooter,
	CardHeader,
	CardRow,
	CardRowAction,
	CardRowContent,
	CardRowIcon,
	CardTitle,
} from "./card";

const meta: Meta = {
	title: "Base/Card",
};

export default meta;

export const Default = () => (
	<View className="flex-1 bg-background p-6">
		<Card>
			<CardHeader>
				<CardTitle>Upcoming appointment</CardTitle>
				<CardAction onPress={() => undefined}>
					<Text className="text-foreground text-xs">Details</Text>
				</CardAction>
			</CardHeader>
			<CardBody>
				<Text className="text-muted text-xs">
					Friday, 10:30 AM with Dr. Leclerc.
				</Text>
			</CardBody>
			<CardFooter>
				<Text className="text-muted text-xs">Clinic: Downtown Medical</Text>
			</CardFooter>
		</Card>
	</View>
);

export const WithIconAction = () => (
	<View className="flex-1 bg-background p-6">
		<Card>
			<CardHeader>
				<CardTitle>Lab results</CardTitle>
				<CardAction onPress={() => undefined} className="px-2">
					<Ionicons
						name="chevron-forward"
						size={16}
						className="text-foreground"
					/>
				</CardAction>
			</CardHeader>
			<CardBody>
				<Text className="text-muted text-xs">
					Latest bloodwork is available for review.
				</Text>
			</CardBody>
		</Card>
	</View>
);

export const Dense = () => (
	<View className="flex-1 bg-background p-6">
		<Card className="p-3">
			<CardHeader className="items-start">
				<View className="gap-1">
					<CardTitle className="text-sm">Daily summary</CardTitle>
					<Text className="text-[11px] text-muted">4 updates</Text>
				</View>
				<CardAction onPress={() => undefined} className="px-2 py-1">
					<Text className="text-[11px] text-muted">Open</Text>
				</CardAction>
			</CardHeader>
		</Card>
	</View>
);

export const AiBorder = () => (
	<View className="flex-1 bg-background p-6">
		<Card variant="ai">
			<CardHeader>
				<CardTitle>AI Summary</CardTitle>
				<CardAction onPress={() => undefined} className="px-2">
					<Ionicons name="sparkles" size={16} className="text-foreground" />
				</CardAction>
			</CardHeader>
			<CardBody>
				<Text className="text-muted text-xs">
					This report highlights anomalies detected in the last scan.
				</Text>
			</CardBody>
			<CardFooter>
				<Text className="text-muted text-xs">Updated 2 minutes ago</Text>
			</CardFooter>
		</Card>
	</View>
);

export const Rows = () => (
	<View className="flex-1 bg-background p-6">
		<Card className="p-0">
			<CardBody className="mt-0">
				<CardRow>
					<CardRowIcon className="border border-panel-border bg-primary/10">
						<Ionicons
							name="person-outline"
							size={18}
							className="text-primary"
						/>
					</CardRowIcon>
					<CardRowContent>
						<CardTitle className="text-sm">Personal information</CardTitle>
						<Text className="text-muted text-xs">Open questionnaire</Text>
					</CardRowContent>
					<CardRowAction>
						<Ionicons name="chevron-forward" size={16} className="text-muted" />
					</CardRowAction>
				</CardRow>
			</CardBody>
		</Card>
	</View>
);

export const Inverse = () => (
	<View className="flex-1 bg-background p-6">
		<Card variant="inverse">
			<CardHeader>
				<CardTitle className="text-white">Coverage status</CardTitle>
				<CardAction
					onPress={() => undefined}
					className="border-white/20 bg-white/10 px-2"
				>
					<Ionicons name="shield-checkmark" size={16} className="text-white" />
				</CardAction>
			</CardHeader>
			<CardBody>
				<Text className="text-white/70 text-xs">
					Priority claims are active and processing.
				</Text>
			</CardBody>
			<CardFooter>
				<Text className="text-white/60 text-xs">Updated 5 minutes ago</Text>
			</CardFooter>
		</Card>
	</View>
);
