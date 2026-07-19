import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import {
	type AppointmentListItem,
	formatAppointmentTime,
	groupByMonth,
	splitUpcomingPast,
} from "@/features/appointments/utils";
import { trpc } from "@/utils/trpc";

export default function CalendarScreen() {
	const accent = useThemeColor("accent");
	const [showPast, setShowPast] = useState(false);
	const appointmentsQuery = useQuery({
		...trpc.appointments.list.queryOptions({ practitionerId: null }),
	});
	const appointments = (appointmentsQuery.data ?? []) as AppointmentListItem[];
	const { upcoming, past } = splitUpcomingPast(appointments, new Date());
	const upcomingGroups = groupByMonth(upcoming);

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/calendar/new")}
							className="h-9 w-9 items-center justify-center rounded-full"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add an appointment"
						>
							<Ionicons name="add" size={22} color={accent} />
						</Pressable>
					),
				}}
			/>

			<VerticalStack className="gap-6">
				{upcoming.length ? (
					upcomingGroups.map((group) => (
						<View key={group.key} className="gap-3">
							<Caption>{group.label}</Caption>
							<VerticalStack className="gap-3">
								{group.items.map((appointment) => (
									<AppointmentRow
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</VerticalStack>
						</View>
					))
				) : (
					<View className="mt-10 items-center gap-2">
						<Ionicons name="calendar-outline" size={36} color={accent} />
						<BodyStrong>No upcoming appointment</BodyStrong>
						<Body className="text-muted text-center">
							Add your next appointment to get a reminder before it.
						</Body>
					</View>
				)}

				{past.length ? (
					<View className="gap-3">
						<Pressable
							onPress={() => setShowPast((current) => !current)}
							className="flex-row items-center gap-2"
							style={pressableFeedback()}
							accessibilityRole="button"
						>
							<Ionicons
								name={showPast ? "chevron-down" : "chevron-forward"}
								size={16}
								color={accent}
							/>
							<Caption>{`Past appointments (${past.length})`}</Caption>
						</Pressable>
						{showPast ? (
							<VerticalStack className="gap-3">
								{past.map((appointment) => (
									<AppointmentRow
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</VerticalStack>
						) : null}
					</View>
				) : null}
			</VerticalStack>
		</Container>
	);
}

function AppointmentRow({ appointment }: { appointment: AppointmentListItem }) {
	return (
		<Pressable
			onPress={() => router.push(`/calendar/${appointment.id}`)}
			style={pressableFeedback()}
		>
			<Card variant="outline">
				<CardBody className="gap-1">
					<Caption>{formatAppointmentTime(appointment)}</Caption>
					<BodyStrong>
						{appointment.practitionerName ?? "Appointment"}
					</BodyStrong>
					{appointment.reason ? (
						<Body className="text-muted" numberOfLines={2}>
							{appointment.reason}
						</Body>
					) : null}
					{appointment.location ? (
						<Caption>{appointment.location}</Caption>
					) : null}
				</CardBody>
			</Card>
		</Pressable>
	);
}
