export type FrequencyUnit = "day" | "week" | "month";
export type DurationUnit = "day" | "week" | "month";

export type MedicationDraft = {
	id: string;
	name: string;
	dosage: string;
	type: string;
	quantity: string;
	frequencyCount: string;
	frequencyUnit: FrequencyUnit;
	durationValue: string;
	durationUnit: DurationUnit;
	frequencyText?: string;
	durationText?: string;
	route?: string | null;
	instructions?: string | null;
};

export type PrescriptionDraft = {
	issuedDate: string;
	validUntil: string;
	prescriberName: string;
	medications: MedicationDraft[];
	notes?: string;
};

export function createMedicationDraft(
	overrides: Partial<MedicationDraft> = {},
): MedicationDraft {
	return {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		name: "",
		dosage: "",
		type: "",
		quantity: "",
		frequencyCount: "",
		frequencyUnit: "day",
		durationValue: "",
		durationUnit: "day",
		...overrides,
	};
}

export function createPrescriptionDraft(): PrescriptionDraft {
	return {
		issuedDate: "",
		validUntil: "",
		prescriberName: "",
		medications: [],
		notes: "",
	};
}
