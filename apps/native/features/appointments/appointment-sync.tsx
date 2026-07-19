import { usePermissionState } from "@/features/reminders/use-reminders";

import type { AppointmentScheduleEntry } from "./notification-service";
import {
	useAppointmentScheduleQuery,
	useAppointmentSync,
} from "./use-appointments";

/**
 * App-root gate keeping appointment notifications in sync with the server
 * schedule, regardless of which screen is focused. Renders nothing.
 */
export function AppointmentSync() {
	const scheduleQuery = useAppointmentScheduleQuery();
	const permission = usePermissionState();
	const schedule = scheduleQuery.data as AppointmentScheduleEntry[] | undefined;
	useAppointmentSync(schedule, permission);
	return null;
}
