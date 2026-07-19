import { describe, expect, it } from "bun:test";

import {
	buildAppointmentSchedule,
	DEFAULT_REMINDER_OFFSET_MINUTES,
	type ScheduleAppointment,
} from "./service";

const NOW = new Date("2026-07-19T10:00:00.000Z");

function appointment(
	overrides: Partial<ScheduleAppointment> & { id: string },
): ScheduleAppointment {
	return {
		startAt: new Date("2026-07-25T09:00:00.000Z"),
		practitionerName: "Dr. Jane Doe",
		reason: null,
		location: null,
		reminderOffsetMinutes: DEFAULT_REMINDER_OFFSET_MINUTES,
		...overrides,
	};
}

describe("buildAppointmentSchedule", () => {
	it("subtracts the offset from the start time", () => {
		const [entry] = buildAppointmentSchedule([appointment({ id: "a" })], NOW);
		expect(entry?.appointmentId).toBe("a");
		expect(entry?.triggerAt).toBe("2026-07-24T09:00:00.000Z");
	});

	it("skips appointments with no reminder", () => {
		expect(
			buildAppointmentSchedule(
				[appointment({ id: "a", reminderOffsetMinutes: null })],
				NOW,
			),
		).toEqual([]);
	});

	it("skips triggers already in the past", () => {
		expect(
			buildAppointmentSchedule(
				[
					appointment({
						id: "a",
						startAt: new Date("2026-07-19T10:30:00.000Z"),
						reminderOffsetMinutes: 60,
					}),
				],
				NOW,
			),
		).toEqual([]);
	});

	it("builds the body from practitioner, reason and location", () => {
		const [withAll] = buildAppointmentSchedule(
			[
				appointment({
					id: "a",
					reason: "Annual check-up",
					location: "City Clinic",
				}),
			],
			NOW,
		);
		expect(withAll?.body).toBe("Dr. Jane Doe · Annual check-up · City Clinic");

		const [bare] = buildAppointmentSchedule(
			[appointment({ id: "b", practitionerName: null })],
			NOW,
		);
		expect(bare?.body).toBe("Appointment");
	});

	it("titles the notification with how far ahead the appointment is", () => {
		const [inADay] = buildAppointmentSchedule([appointment({ id: "a" })], NOW);
		expect(inADay?.title).toBe("Appointment tomorrow");

		const [inAnHour] = buildAppointmentSchedule(
			[
				appointment({
					id: "b",
					startAt: new Date("2026-07-20T09:00:00.000Z"),
					reminderOffsetMinutes: 60,
				}),
			],
			NOW,
		);
		expect(inAnHour?.title).toBe("Appointment in 1 hour");

		const [inAWeek] = buildAppointmentSchedule(
			[
				appointment({
					id: "c",
					startAt: new Date("2026-08-02T09:00:00.000Z"),
					reminderOffsetMinutes: 10080,
				}),
			],
			NOW,
		);
		expect(inAWeek?.title).toBe("Appointment in 1 week");
	});

	it("sorts entries by trigger time", () => {
		const entries = buildAppointmentSchedule(
			[
				appointment({
					id: "late",
					startAt: new Date("2026-08-01T09:00:00.000Z"),
				}),
				appointment({
					id: "soon",
					startAt: new Date("2026-07-21T09:00:00.000Z"),
				}),
			],
			NOW,
		);
		expect(entries.map((entry) => entry.appointmentId)).toEqual([
			"soon",
			"late",
		]);
	});
});
