import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { trpc } from "@/utils/trpc";

import {
	getPermissionState,
	type PermissionState,
	type ScheduleEntry,
	syncScheduledNotifications,
} from "./notification-service";

export function useRemindersQuery() {
	return useQuery({ ...trpc.reminders.list.queryOptions() });
}

export function useReminderMutations() {
	const queryClient = useQueryClient();
	const onSettled = () => {
		queryClient.invalidateQueries(trpc.reminders.list.queryFilter());
	};

	const upsert = useMutation(
		trpc.reminders.upsert.mutationOptions({ onSettled }),
	);
	const remove = useMutation(
		trpc.reminders.delete.mutationOptions({ onSettled }),
	);
	const updateSettings = useMutation(
		trpc.reminders.updateSettings.mutationOptions({ onSettled }),
	);

	return { upsert, remove, updateSettings };
}

/**
 * Keep the OS-scheduled notifications in sync with the server schedule:
 * re-sync whenever the schedule changes and whenever the app returns to the
 * foreground. Only schedules when permission is granted.
 */
export function useReminderSync(
	schedule: ScheduleEntry[] | undefined,
	permission: PermissionState,
) {
	const serialized = JSON.stringify(schedule ?? []);

	useEffect(() => {
		if (permission !== "granted") return;
		const parsed = JSON.parse(serialized) as ScheduleEntry[];
		void syncScheduledNotifications(parsed);
	}, [serialized, permission]);

	useEffect(() => {
		const handler = (state: AppStateStatus) => {
			if (state !== "active" || permission !== "granted") return;
			const parsed = JSON.parse(serialized) as ScheduleEntry[];
			void syncScheduledNotifications(parsed);
		};
		const sub = AppState.addEventListener("change", handler);
		return () => sub.remove();
	}, [serialized, permission]);
}

/**
 * Track the current notification permission state, refreshing when the app
 * returns to the foreground (the user may have changed it in Settings).
 */
/**
 * Deep-link into a medication's reminder screen when the user taps a reminder
 * notification. Mounted once at the app root.
 */
function openReminderFromResponse(
	response: Notifications.NotificationResponse,
) {
	const data = response.notification.request.content.data;
	if (data?.type !== "medication-reminder") return;
	const name =
		typeof data.medicationName === "string" ? data.medicationName : "";
	if (!name) return;
	const dosage =
		typeof data.medicationDosage === "string" ? data.medicationDosage : "";
	router.push({
		pathname: "/reminders/[med]",
		params: {
			med: encodeURIComponent(name),
			dosage: encodeURIComponent(dosage),
		},
	});
}

export function useReminderNotificationObserver() {
	// Cold-start taps (app launched by tapping a notification).
	const lastResponse = Notifications.useLastNotificationResponse();
	useEffect(() => {
		if (lastResponse) openReminderFromResponse(lastResponse);
	}, [lastResponse]);

	// Warm taps (app already running).
	useEffect(() => {
		const sub = Notifications.addNotificationResponseReceivedListener(
			openReminderFromResponse,
		);
		return () => sub.remove();
	}, []);
}

export function usePermissionState() {
	const [state, setState] = useState<PermissionState>("undetermined");

	useEffect(() => {
		let mounted = true;
		const refresh = () =>
			getPermissionState().then((value) => {
				if (mounted) setState(value);
			});
		void refresh();
		const sub = AppState.addEventListener("change", (status) => {
			if (status === "active") void refresh();
		});
		return () => {
			mounted = false;
			sub.remove();
		};
	}, []);

	return state;
}
