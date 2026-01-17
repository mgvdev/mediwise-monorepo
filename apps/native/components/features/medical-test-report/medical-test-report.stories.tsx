import { Ionicons } from "@expo/vector-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { Text, View } from "react-native";

import {
	MedicalTestReport,
	MedicalTestReportBody,
	MedicalTestReportFooter,
	MedicalTestReportHeader,
} from "./medical-test-report";

const meta = {
	title: "Medical/MedicalTestReport",
	component: MedicalTestReport,
} satisfies Meta<typeof MedicalTestReport>;

export default meta;

type Story = StoryObj<typeof MedicalTestReport>;

export const Default: Story = {
	render: () => (
		<View className="flex-1 bg-background p-6">
			<MedicalTestReport defaultOpen>
				<MedicalTestReportHeader
					timestamp="March 12, 10:30 AM"
					title="Cardiac MRI Test"
					status="normal"
					leading={
						<Ionicons name="heart-outline" size={24} className="text-primary" />
					}
				/>
				<MedicalTestReportBody>
					<View className="flex-row gap-6">
						<Text className="w-20 font-semibold text-foreground text-sm">
							Type
						</Text>
						<Text className="flex-1 text-muted text-sm">
							Checking for blocked arteries & heart function
						</Text>
					</View>
					<View className="mt-4 flex-row gap-6">
						<Text className="w-20 font-semibold text-foreground text-sm">
							Purpose
						</Text>
						<Text className="flex-1 text-muted text-sm">
							Mild narrowing in the left coronary artery — requires monitoring
						</Text>
					</View>
				</MedicalTestReportBody>
				<MedicalTestReportFooter>
					<Text className="font-semibold text-primary text-sm">
						View full report
					</Text>
				</MedicalTestReportFooter>
			</MedicalTestReport>
		</View>
	),
};

export const Collapsed: Story = {
	render: () => (
		<View className="flex-1 bg-background p-6">
			<MedicalTestReport>
				<MedicalTestReportHeader
					timestamp="March 12, 10:30 AM"
					title="Cardiac MRI Test"
					status="normal"
					leading={
						<Ionicons name="heart-outline" size={24} className="text-primary" />
					}
				/>
			</MedicalTestReport>
		</View>
	),
};
