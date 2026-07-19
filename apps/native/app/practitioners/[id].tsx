import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import {
	PractitionerForm,
	type PractitionerFormValues,
} from "@/components/features/practitioner/practitioner-form";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { queryClient, trpc } from "@/utils/trpc";

type AppointmentListItem = {
	id: string;
	startAt: string | Date;
	reason: string | null;
	location: string | null;
};

export default function PractitionerDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = params.id;
	const accent = useThemeColor("accent");
	const [error, setError] = useState<string | null>(null);

	const practitionerQuery = useQuery({
		...trpc.practitioners.get.queryOptions({ id }),
		enabled: Boolean(id),
	});
	const appointmentsQuery = useQuery({
		...trpc.appointments.list.queryOptions({ practitionerId: id }),
		enabled: Boolean(id),
	});

	const saveMutation = useMutation(
		trpc.practitioners.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the practitioner.");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.practitioners.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't delete the practitioner.");
			},
		}),
	);

	const practitioner = practitionerQuery.data;
	const now = Date.now();
	const upcoming = ((appointmentsQuery.data ?? []) as AppointmentListItem[])
		.filter((item) => new Date(item.startAt).getTime() >= now)
		.slice(0, 5);

	const handleSubmit = (values: PractitionerFormValues) => {
		setError(null);
		saveMutation.mutate({ ...values, id });
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete practitioner",
			"Their appointments are kept, but will no longer be linked to them.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => deleteMutation.mutate({ id }),
				},
			],
		);
	};

	if (practitionerQuery.isPending) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center">
					<Spinner />
				</View>
			</Container>
		);
	}

	if (!practitioner) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center gap-2">
					<BodyStrong>Practitioner not found</BodyStrong>
				</View>
			</Container>
		);
	}

	return (
		<Container className="px-6 pt-4 pb-12">
			<VerticalStack className="gap-6">
				<View className="gap-3">
					{practitioner.phone ? (
						<ContactRow
							icon="call-outline"
							label={practitioner.phone}
							color={accent}
							onPress={() => Linking.openURL(`tel:${practitioner.phone}`)}
						/>
					) : null}
					{practitioner.email ? (
						<ContactRow
							icon="mail-outline"
							label={practitioner.email}
							color={accent}
							onPress={() => Linking.openURL(`mailto:${practitioner.email}`)}
						/>
					) : null}
					{practitioner.address ? (
						<ContactRow
							icon="location-outline"
							label={practitioner.address}
							color={accent}
							onPress={() =>
								Linking.openURL(
									`https://maps.google.com/?q=${encodeURIComponent(
										practitioner.address ?? "",
									)}`,
								)
							}
						/>
					) : null}
				</View>

				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Caption>Upcoming appointments</Caption>
						<Pressable
							onPress={() =>
								router.push(`/calendar/new?practitionerId=${practitioner.id}`)
							}
							className="border-panel-border h-8 w-8 items-center justify-center rounded-full border"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add an appointment"
						>
							<Ionicons name="add" size={16} color={accent} />
						</Pressable>
					</View>
					{upcoming.length ? (
						<VerticalStack className="gap-3">
							{upcoming.map((appointment) => (
								<Pressable
									key={appointment.id}
									onPress={() => router.push(`/calendar/${appointment.id}`)}
									style={pressableFeedback()}
								>
									<Card variant="outline">
										<CardBody className="gap-1">
											<BodyStrong>
												{new Date(appointment.startAt).toLocaleString()}
											</BodyStrong>
											{appointment.reason ? (
												<Body className="text-muted">{appointment.reason}</Body>
											) : null}
										</CardBody>
									</Card>
								</Pressable>
							))}
						</VerticalStack>
					) : (
						<Body className="text-muted">No upcoming appointment.</Body>
					)}
				</View>

				<PractitionerForm
					initial={practitioner}
					onSubmit={handleSubmit}
					isSaving={saveMutation.isPending}
					submitLabel="Save changes"
					error={error}
					onDelete={handleDelete}
					isDeleting={deleteMutation.isPending}
				/>
			</VerticalStack>
		</Container>
	);
}

type ContactRowProps = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	color: string;
	onPress: () => void;
};

function ContactRow({ icon, label, color, onPress }: ContactRowProps) {
	return (
		<Pressable onPress={onPress} style={pressableFeedback()}>
			<Card variant="outline">
				<CardBody className="flex-row items-center gap-3">
					<Ionicons name={icon} size={18} color={color} />
					<Body className="flex-1">{label}</Body>
				</CardBody>
			</Card>
		</Pressable>
	);
}
