/**
 * Practitioner specialties offered by the directory form. Keys are stored in
 * the database; labels are display-only. "other" unlocks a free-text field.
 */
export const SPECIALTIES = [
	{ key: "general_practitioner", label: "General practitioner" },
	{ key: "pediatrician", label: "Pediatrician" },
	{ key: "cardiologist", label: "Cardiologist" },
	{ key: "dermatologist", label: "Dermatologist" },
	{ key: "dentist", label: "Dentist" },
	{ key: "ophthalmologist", label: "Ophthalmologist" },
	{ key: "gynecologist", label: "Gynecologist" },
	{ key: "endocrinologist", label: "Endocrinologist" },
	{ key: "gastroenterologist", label: "Gastroenterologist" },
	{ key: "neurologist", label: "Neurologist" },
	{ key: "oncologist", label: "Oncologist" },
	{ key: "orthopedist", label: "Orthopedist" },
	{ key: "psychiatrist", label: "Psychiatrist" },
	{ key: "psychologist", label: "Psychologist" },
	{ key: "pulmonologist", label: "Pulmonologist" },
	{ key: "rheumatologist", label: "Rheumatologist" },
	{ key: "urologist", label: "Urologist" },
	{ key: "physiotherapist", label: "Physiotherapist" },
	{ key: "nurse", label: "Nurse" },
	{ key: "midwife", label: "Midwife" },
	{ key: "pharmacist", label: "Pharmacist" },
	{ key: "dietitian", label: "Dietitian" },
	{ key: "other", label: "Other" },
] as const;

export const SPECIALTY_OPTIONS = SPECIALTIES.map((specialty) => ({
	value: specialty.key,
	label: specialty.label,
}));

/** Display label for a stored specialty key, falling back to the free text. */
export function specialtyLabel(key: string, other?: string | null) {
	if (key === "other") return other?.trim() || "Other";
	return (
		SPECIALTIES.find((specialty) => specialty.key === key)?.label ?? "Other"
	);
}
