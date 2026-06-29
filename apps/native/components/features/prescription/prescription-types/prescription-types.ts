export type FrequencyUnit = "day" | "week" | "month";
export type DurationUnit = "day" | "week" | "month";
export type DurationType = "one_off" | "chronic";

// Short, common galenic forms (6.3). Stored as the `value`; UI shows `label`.
export const MEDICATION_FORMS = [
	{ value: "tablet", label: "Comprimé" },
	{ value: "capsule", label: "Gélule" },
	{ value: "syrup", label: "Sirop" },
	{ value: "solution", label: "Solution buvable" },
	{ value: "injection", label: "Injection" },
	{ value: "cream", label: "Crème / pommade" },
	{ value: "drops", label: "Gouttes" },
	{ value: "inhaler", label: "Inhalateur" },
	{ value: "patch", label: "Patch" },
	{ value: "suppository", label: "Suppositoire" },
] as const;

// Structured intake moments (6.3 posologie / moment de prise).
export const INTAKE_MOMENTS = [
	{ value: "morning", label: "Matin" },
	{ value: "noon", label: "Midi" },
	{ value: "evening", label: "Soir" },
	{ value: "bedtime", label: "Coucher" },
	{ value: "with_meal", label: "Pendant le repas" },
] as const;

const FORM_LABELS = new Map<string, string>(
	MEDICATION_FORMS.map((f) => [f.value, f.label]),
);
const MOMENT_LABELS = new Map<string, string>(
	INTAKE_MOMENTS.map((m) => [m.value, m.label]),
);

export function formatMedicationForm(value?: string | null) {
	if (!value) return null;
	return FORM_LABELS.get(value) ?? value;
}

export function formatIntakeMoments(values?: string[] | null) {
	if (!values?.length) return [];
	return values.map((value) => MOMENT_LABELS.get(value) ?? value);
}

export type MedicationDraft = {
	id: string;
	name: string;
	dosage: string;
	frequencyCount: string;
	frequencyUnit: FrequencyUnit;
	durationType: DurationType;
	durationValue: string;
	durationUnit: DurationUnit;
	frequencyText?: string;
	durationText?: string;
	route?: string | null;
	instructions?: string | null;
	comment?: string | null;
	form?: string | null;
	intakeMoments?: string[];
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
		frequencyCount: "",
		frequencyUnit: "day",
		durationType: "one_off",
		durationValue: "",
		durationUnit: "day",
		comment: "",
		form: null,
		intakeMoments: [],
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
