import type { ScheduleEntry } from "./notification-service";
import {
	usePermissionState,
	useRemindersQuery,
	useReminderSync,
} from "./use-reminders";

/**
 * App-root gate that keeps OS notifications in sync with the server schedule,
 * regardless of which screen is focused. Renders nothing.
 */
export function ReminderSync() {
	const remindersQuery = useRemindersQuery();
	const permission = usePermissionState();
	const schedule = remindersQuery.data?.schedule as ScheduleEntry[] | undefined;
	useReminderSync(schedule, permission);
	return null;
}
