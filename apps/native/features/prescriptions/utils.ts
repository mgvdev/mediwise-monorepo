import {
	createMedicationDraft,
	type MedicationDraft,
	type PrescriptionDraft,
} from "@/components/features/prescription/prescription-types";

type UnifiedPrescriptionData = {
	issuedDate?: string | null;
	validUntil?: string | null;
	prescriberName?: string | null;
	medications?: Array<{
		name: string;
		dosage?: string | null;
		frequency?: string | null;
		frequencyCount?: number | null;
		frequencyUnit?: "day" | "week" | "month" | null;
		durationType?: "one_off" | "chronic" | null;
		duration?: string | null;
		durationValue?: number | null;
		durationUnit?: "day" | "week" | "month" | null;
		route?: string | null;
		instructions?: string | null;
		form?: string | null;
		intakeMoments?: string[] | null;
	}>;
};

type SavePayload = {
	id?: string | null;
	rawId?: string | null;
	issuedDate: string | null;
	validUntil: string | null;
	prescriberName: string | null;
	medications: Array<{
		name: string;
		dosage: string | null;
		frequency: string | null;
		frequencyCount: number | null;
		frequencyUnit: "day" | "week" | "month" | null;
		durationType: "one_off" | "chronic" | null;
		duration: string | null;
		durationValue: number | null;
		durationUnit: "day" | "week" | "month" | null;
		route: string | null;
		instructions: string | null;
		form: string | null;
		intakeMoments: string[] | null;
	}>;
	notes: string | null;
};

function addDays(date: Date, days: number) {
	const next = new Date(date.getTime());
	next.setDate(next.getDate() + days);
	return next;
}

function durationToDays(value: number, unit: "day" | "week" | "month") {
	if (unit === "week") return value * 7;
	if (unit === "month") return value * 30;
	return value;
}

export function computeValidUntil(
	issuedDate: string,
	medications: MedicationDraft[],
) {
	const parsed = new Date(issuedDate);
	if (Number.isNaN(parsed.getTime())) return "";
	const durations = medications
		.map((medication) => {
			if (medication.durationType === "chronic") return 0;
			const count = Number.parseInt(medication.durationValue, 10);
			if (!count) return 0;
			return durationToDays(count, medication.durationUnit);
		})
		.filter((value) => value > 0);
	if (!durations.length) return "";
	const maxDays = Math.max(...durations);
	return addDays(parsed, maxDays).toISOString().slice(0, 10);
}

export function mapUnifiedToDraft(data: UnifiedPrescriptionData) {
	return {
		issuedDate: data.issuedDate ?? "",
		validUntil: data.validUntil ?? "",
		prescriberName: data.prescriberName ?? "",
		medications: (data.medications ?? []).map((medication) =>
			createMedicationDraft({
				name: medication.name ?? "",
				dosage: medication.dosage ?? "",
				frequencyCount: medication.frequencyCount
					? String(medication.frequencyCount)
					: "",
				frequencyUnit: medication.frequencyUnit ?? "day",
				durationType:
					medication.durationType ??
					(medication.durationValue ? "one_off" : "chronic"),
				durationValue: medication.durationValue
					? String(medication.durationValue)
					: "",
				durationUnit: medication.durationUnit ?? "day",
				frequencyText: medication.frequency ?? undefined,
				durationText: medication.duration ?? undefined,
				route: medication.route ?? null,
				instructions: medication.instructions ?? null,
				form: medication.form ?? null,
				intakeMoments: medication.intakeMoments ?? [],
			}),
		),
	};
}

export function buildPrescriptionPayload(input: {
	draft: PrescriptionDraft;
	id?: string | null;
	rawId?: string | null;
}): SavePayload {
	const draft = input.draft;
	return {
		id: input.id,
		rawId: input.rawId ?? null,
		issuedDate: draft.issuedDate.trim() || null,
		validUntil: draft.validUntil.trim() || null,
		prescriberName: draft.prescriberName.trim() || null,
		medications: draft.medications.map((medication) => {
			const frequencyCount = Number.parseInt(medication.frequencyCount, 10);
			const durationValue = Number.parseInt(medication.durationValue, 10);
			const frequencyText =
				frequencyCount && medication.frequencyUnit
					? `${frequencyCount} per ${medication.frequencyUnit}`
					: (medication.frequencyText ?? null);
			const durationText =
				durationValue && medication.durationUnit
					? `${durationValue} ${medication.durationUnit}`
					: (medication.durationText ?? null);
			return {
				name: medication.name.trim(),
				dosage: medication.dosage.trim() || null,
				frequency: frequencyText,
				frequencyCount: Number.isNaN(frequencyCount) ? null : frequencyCount,
				frequencyUnit: medication.frequencyCount
					? medication.frequencyUnit
					: null,
				durationType: medication.durationType ?? null,
				duration: durationText,
				durationValue: Number.isNaN(durationValue) ? null : durationValue,
				durationUnit:
					medication.durationType === "one_off" && medication.durationValue
						? medication.durationUnit
						: null,
				route: medication.route ?? null,
				instructions: medication.instructions ?? null,
				form: medication.form ?? null,
				intakeMoments: medication.intakeMoments?.length
					? medication.intakeMoments
					: null,
			};
		}),
		notes: draft.notes?.trim() || null,
	};
}
