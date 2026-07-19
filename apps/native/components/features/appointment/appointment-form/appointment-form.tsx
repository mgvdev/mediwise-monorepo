import { useQuery } from "@tanstack/react-query";
import { Button, Input, Label, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { DateTimePickerField } from "@/components/base/date-time-picker";
import { OptionsPicker } from "@/components/base/options-picker";
import { Caption } from "@/components/base/typography";
import {
	DEFAULT_OFFSET_KEY,
	OFFSET_MINUTES,
	offsetKeyFromMinutes,
	REMINDER_OFFSET_OPTIONS,
} from "@/features/appointments/reminder-offsets";
import {
	formatPractitionerName,
	type PractitionerListItem,
} from "@/features/practitioners/utils";
import { ensurePermission } from "@/features/reminders/notification-service";
import { usePermissionState } from "@/features/reminders/use-reminders";
import { trpc } from "@/utils/trpc";

export type AppointmentFormValues = {
	practitionerId: string | null;
	/** ISO 8601 instant. */
	startAt: string;
	reason: string | null;
	location: string | null;
	notes: string | null;
	reminderOffsetMinutes: number | null;
};

type AppointmentFormProps = {
	initial?: Partial<AppointmentFormValues>;
	onSubmit: (values: AppointmentFormValues) => void;
	isSaving?: boolean;
	submitLabel?: string;
	error?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

const NO_PRACTITIONER = "none";

export function AppointmentForm({
	initial,
	onSubmit,
	isSaving,
	submitLabel = "Save",
	error,
	onDelete,
	isDeleting,
}: AppointmentFormProps) {
	const practitionersQuery = useQuery({
		...trpc.practitioners.list.queryOptions({ search: null }),
	});
	const practitioners = (practitionersQuery.data ??
		[]) as PractitionerListItem[];

	const [practitionerId, setPractitionerId] = useState(
		initial?.practitionerId ?? NO_PRACTITIONER,
	);
	const [startAt, setStartAt] = useState<string | null>(
		initial?.startAt ?? null,
	);
	const [reason, setReason] = useState(initial?.reason ?? "");
	const [location, setLocation] = useState(initial?.location ?? "");
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [offsetKey, setOffsetKey] = useState(
		initial?.reminderOffsetMinutes === undefined
			? DEFAULT_OFFSET_KEY
			: offsetKeyFromMinutes(initial.reminderOffsetMinutes),
	);
	const [localError, setLocalError] = useState<string | null>(null);
	const permission = usePermissionState();

	const practitionerOptions = [
		{ value: NO_PRACTITIONER, label: "No practitioner" },
		...practitioners.map((practitioner) => ({
			value: practitioner.id,
			label: formatPractitionerName(practitioner),
		})),
	];

	const handleSubmit = () => {
		if (!startAt) {
			setLocalError("Pick a date and time.");
			return;
		}
		setLocalError(null);
		// Ask for notification permission the first time a reminder is set. The
		// appointment saves either way; the reminder simply won't fire if denied.
		if (offsetKey !== "none" && permission === "undetermined") {
			void ensurePermission();
		}
		onSubmit({
			practitionerId:
				practitionerId === NO_PRACTITIONER ? null : practitionerId,
			startAt,
			reason: reason.trim() || null,
			location: location.trim() || null,
			notes: notes.trim() || null,
			reminderOffsetMinutes: OFFSET_MINUTES[offsetKey] ?? null,
		});
	};

	return (
		<View className="gap-4">
			<OptionsPicker
				label="Practitioner"
				title="Select a practitioner"
				options={practitionerOptions}
				value={practitionerId}
				onChange={setPractitionerId}
				helperText="Optional — add one from the Practitioners screen first."
			/>

			<DateTimePickerField
				label="Date and time"
				value={startAt}
				onChange={setStartAt}
			/>

			<TextField>
				<Label>Reason</Label>
				<Input
					value={reason}
					onChangeText={setReason}
					placeholder="Annual check-up, follow-up…"
				/>
			</TextField>

			<TextField>
				<Label>Location</Label>
				<Input
					value={location}
					onChangeText={setLocation}
					placeholder="City Clinic, room 4"
				/>
			</TextField>

			<TextField>
				<Label>Notes</Label>
				<Input
					value={notes}
					onChangeText={setNotes}
					placeholder="Bring the last blood test"
					multiline
				/>
			</TextField>

			<OptionsPicker
				label="Reminder"
				title="Remind me"
				options={REMINDER_OFFSET_OPTIONS}
				value={offsetKey}
				onChange={setOffsetKey}
			/>

			{offsetKey !== "none" && permission === "denied" ? (
				<Caption className="text-muted">
					Notifications are off for Mediwise — this reminder won't be delivered
					until you enable them in your device settings.
				</Caption>
			) : null}

			{error || localError ? (
				<Caption className="text-danger">{error ?? localError}</Caption>
			) : null}

			<Button onPress={handleSubmit} isDisabled={isSaving} className="mt-2">
				{isSaving ? (
					<Spinner size="sm" color="default" />
				) : (
					<Button.Label>{submitLabel}</Button.Label>
				)}
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Deleting…" : "Delete appointment"}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
