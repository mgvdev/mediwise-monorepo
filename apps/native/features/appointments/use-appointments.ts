import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import type { PermissionState } from "@/features/reminders/notification-service";
import { trpc } from "@/utils/trpc";

import {
	APPOINTMENT_DATA_TYPE,
	type AppointmentScheduleEntry,
	syncAppointmentNotifications,
} from "./notification-service";

export function useAppointmentScheduleQuery() {
	return useQuery({ ...trpc.appointments.schedule.queryOptions() });
}

/**
 * Keep OS-scheduled notifications in sync with the server schedule: re-sync
 * whenever the schedule changes and whenever the app returns to the foreground.
 */
export function useAppointmentSync(
	schedule: AppointmentScheduleEntry[] | undefined,
	permission: PermissionState,
) {
	const serialized = JSON.stringify(schedule ?? []);

	useEffect(() => {
		if (permission !== "granted") return;
		const parsed = JSON.parse(serialized) as AppointmentScheduleEntry[];
		void syncAppointmentNotifications(parsed);
	}, [serialized, permission]);

	useEffect(() => {
		const handler = (state: AppStateStatus) => {
			if (state !== "active" || permission !== "granted") return;
			const parsed = JSON.parse(serialized) as AppointmentScheduleEntry[];
			void syncAppointmentNotifications(parsed);
		};
		const sub = AppState.addEventListener("change", handler);
		return () => sub.remove();
	}, [serialized, permission]);
}

function openAppointmentFromResponse(
	response: Notifications.NotificationResponse,
) {
	const data = response.notification.request.content.data;
	if (data?.type !== APPOINTMENT_DATA_TYPE) return;
	const id = typeof data.appointmentId === "string" ? data.appointmentId : "";
	if (!id) return;
	router.push({ pathname: "/calendar/[id]", params: { id } });
}

/** Deep-link into an appointment when its reminder is tapped. */
export function useAppointmentNotificationObserver() {
	const lastResponse = Notifications.useLastNotificationResponse();
	useEffect(() => {
		if (lastResponse) openAppointmentFromResponse(lastResponse);
	}, [lastResponse]);

	useEffect(() => {
		const sub = Notifications.addNotificationResponseReceivedListener(
			openAppointmentFromResponse,
		);
		return () => sub.remove();
	}, []);
}
