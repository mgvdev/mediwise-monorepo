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
		<View className="bg-background flex-1 p-6">
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
						<Text className="text-foreground w-20 text-sm font-semibold">
							Type
						</Text>
						<Text className="text-muted flex-1 text-sm">
							Checking for blocked arteries & heart function
						</Text>
					</View>
					<View className="mt-4 flex-row gap-6">
						<Text className="text-foreground w-20 text-sm font-semibold">
							Purpose
						</Text>
						<Text className="text-muted flex-1 text-sm">
							Mild narrowing in the left coronary artery — requires monitoring
						</Text>
					</View>
				</MedicalTestReportBody>
				<MedicalTestReportFooter>
					<Text className="text-primary text-sm font-semibold">
						View full report
					</Text>
				</MedicalTestReportFooter>
			</MedicalTestReport>
		</View>
	),
};

export const Collapsed: Story = {
	render: () => (
		<View className="bg-background flex-1 p-6">
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
