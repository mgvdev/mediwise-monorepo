import { describe, expect, it } from "bun:test";

import {
	buildReminderFromMedication,
	computeSchedule,
	DEFAULT_TIME_MAP,
	getReminders,
	resolveMomentTime,
	type ReminderConfig,
	buildMedicationKey,
} from "./service";

describe("resolveMomentTime", () => {
	it("prefers per-moment override, then time map, then default", () => {
		expect(
			resolveMomentTime("morning", { morning: "07:15" }, { morning: "06:00" }),
		).toBe("06:00");
		expect(resolveMomentTime("morning", { morning: "07:15" }, {})).toBe(
			"07:15",
		);
		expect(resolveMomentTime("morning", {}, {})).toBe(
			DEFAULT_TIME_MAP.morning ?? "08:00",
		);
		expect(resolveMomentTime("unknown", {}, {})).toBe("09:00");
	});
});

describe("buildReminderFromMedication", () => {
	it("seeds enabled reminder from known intake moments", () => {
		const reminder = buildReminderFromMedication({
			name: "Doliprane",
			dosage: "500mg",
			intakeMoments: ["morning", "evening", "bogus"],
			status: "active",
		});
		expect(reminder.enabled).toBe(true);
		expect(reminder.moments).toEqual(["morning", "evening"]);
	});

	it("returns the existing config unchanged when provided", () => {
		const existing: ReminderConfig = {
			medicationName: "X",
			medicationDosage: null,
			enabled: false,
			moments: ["noon"],
			timeOverrides: {},
			daysOfWeek: [],
		};
		expect(
			buildReminderFromMedication({ name: "X", status: "active" }, existing),
		).toBe(existing);
	});
});

describe("computeSchedule", () => {
	const activeKeys = new Set([
		buildMedicationKey({ name: "Doliprane", dosage: "500mg" }),
	]);

	it("flattens enabled reminders of active meds into sorted entries", () => {
		const reminders: ReminderConfig[] = [
			{
				medicationName: "Doliprane",
				medicationDosage: "500mg",
				enabled: true,
				moments: ["evening", "morning"],
				timeOverrides: { evening: "20:00" },
				daysOfWeek: [],
			},
		];
		const schedule = computeSchedule(reminders, activeKeys, DEFAULT_TIME_MAP);
		expect(schedule.map((e) => e.time)).toEqual(["08:00", "20:00"]);
		expect(schedule[0]?.moment).toBe("morning");
	});

	it("drops disabled reminders and reminders for inactive meds", () => {
		const reminders: ReminderConfig[] = [
			{
				medicationName: "Doliprane",
				medicationDosage: "500mg",
				enabled: false,
				moments: ["morning"],
			},
			{
				medicationName: "Ibuprofen",
				medicationDosage: "200mg",
				enabled: true,
				moments: ["noon"],
			},
		];
		expect(computeSchedule(reminders, activeKeys, DEFAULT_TIME_MAP)).toEqual(
			[],
		);
	});
});

describe("getReminders", () => {
	it("joins reminders against active meds and computes schedule", async () => {
		const result = await getReminders({
			userId: "u1",
			fetchReminders: async () => [
				{
					medicationName: "Doliprane",
					medicationDosage: "500mg",
					enabled: true,
					moments: ["morning"],
				},
				{
					medicationName: "OldMed",
					medicationDosage: null,
					enabled: true,
					moments: ["noon"],
				},
			],
			fetchTimeMap: async () => ({ morning: "07:30" }),
			fetchMedications: async () => ({
				medications: [
					{
						name: "Doliprane",
						dosage: "500mg",
						intakeMoments: ["morning"],
						status: "active",
					},
					{
						name: "OldMed",
						dosage: null,
						intakeMoments: ["noon"],
						status: "ended",
					},
				],
				updatedAt: null,
			}),
		});

		expect(result.timeMap.morning).toBe("07:30");
		expect(
			result.reminders.find((r) => r.medicationName === "Doliprane")
				?.medicationActive,
		).toBe(true);
		expect(
			result.reminders.find((r) => r.medicationName === "OldMed")
				?.medicationActive,
		).toBe(false);
		// OldMed is ended → excluded from schedule.
		expect(result.schedule).toHaveLength(1);
		expect(result.schedule[0]).toMatchObject({
			medicationName: "Doliprane",
			time: "07:30",
		});
	});
});
