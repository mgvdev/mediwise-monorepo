export type FieldType =
	| "string"
	| "number"
	| "choice"
	| "list"
	| "date"
	| "blood_pressure";

export type HealthField = {
	label: string;
	type: FieldType;
	choices?: string[];
	// Set optional: true for questions that can be skipped (e.g. no allergies).
	optional?: boolean;
	// Show a free-text comment field when the answer is "yes".
	// Remove this flag to hide the follow-up comment input.
	commentOnYes?: { label: string };
};

export type HealthCategory = {
	key: string;
	label: string;
	fields: Record<string, HealthField>;
	// Only show this category when the user's biological sex matches.
	// Remove this field to show for everyone.
	onlyForSex?: "male" | "female";
};

export type BiologicalSex = "male" | "female";

export function filterHealthCategoriesBySex(
	categories: HealthCategory[],
	sex?: string | null,
) {
	if (sex !== "male" && sex !== "female") {
		return categories;
	}
	return categories.filter(
		(category) => !category.onlyForSex || category.onlyForSex === sex,
	);
}

export const healthCategories: HealthCategory[] = [
	{
		key: "personal_information",
		label: "Personal information",
		fields: {
			last_name: { label: "Last name", type: "string" },
			first_name: { label: "First name", type: "string" },
			birth_date: { label: "Date of birth", type: "date" },
			biological_sex: {
				label: "Biological sex",
				type: "choice",
				choices: ["male", "female"],
			},
			blood_group: { label: "Blood group", type: "string" },
			height_cm: { label: "Height (cm)", type: "number" },
			weight_kg: { label: "Weight (kg)", type: "number" },
		},
	},
	{
		key: "vital_signs",
		label: "Vital signs",
		fields: {
			blood_pressure: {
				label: "Blood pressure",
				type: "blood_pressure",
				optional: true,
			},
		},
	},
	{
		key: "allergies",
		label: "Allergies",
		fields: {
			details: {
				label: "Drug or food allergies",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "habits",
		label: "Habits",
		fields: {
			tobacco: {
				label: "Tobacco use",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			alcohol: {
				label: "Alcohol use",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			drugs: {
				label: "Recreational drug use",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			other: {
				label: "Other relevant habits",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "family_history",
		label: "Family medical history",
		fields: {
			diabetes: {
				label: "Family history of diabetes",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			hypertension: {
				label: "Family history of hypertension",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			heart_disease: {
				label: "Family history of heart disease",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			cancer: {
				label: "Family history of cancer",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			cancer_details: {
				label: "Cancer type, relative and age",
				type: "list",
				optional: true,
			},
			neurodegenerative: {
				label: "Family history of neurodegenerative diseases",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, add details" },
			},
			other: {
				label: "Other family medical history",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "surgical_history",
		label: "Surgical history",
		fields: {
			has_surgery: {
				label: "Have you had any surgical procedures?",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, provide details" },
			},
			details: {
				label: "Surgical procedures details",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "cardiology",
		label: "Cardiovascular conditions",
		fields: {
			hypertension: {
				label: "Arterial hypertension",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			angina: {
				label: "Angina",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			myocardial_infarction: {
				label: "History of myocardial infarction or stent",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			heart_failure: {
				label: "Heart failure",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			arrhythmia: {
				label: "Cardiac arrhythmia",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other cardiovascular conditions",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "pulmonology",
		label: "Pulmonary conditions",
		fields: {
			asthma: {
				label: "Asthma",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			copd: {
				label: "COPD",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			pulmonary_embolism: {
				label: "Pulmonary embolism",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			emphysema: {
				label: "Emphysema",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			sleep_apnea: {
				label: "Obstructive sleep apnea syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other pulmonary conditions",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "neurology",
		label: "Neurological conditions",
		fields: {
			stroke_history: {
				label: "History of stroke or TIA",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			epilepsy: {
				label: "Epilepsy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			chronic_migraines: {
				label: "Chronic migraines",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			parkinson: {
				label: "Parkinson’s disease",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			multiple_sclerosis: {
				label: "Multiple sclerosis",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			brain_tumor: {
				label: "History of brain tumor",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other neurological conditions",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "endocrinology",
		label: "Endocrine and metabolic disorders",
		fields: {
			diabetes: {
				label: "Diabetes (type 1 or 2)",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			diabetes_complications: {
				label: "Diabetes complications",
				type: "choice",
				choices: ["yes", "no"],
			},
			hypothyroidism: {
				label: "Hypothyroidism",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			hyperthyroidism: {
				label: "Hyperthyroidism",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			cushing: {
				label: "Cushing syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			addison: {
				label: "Addison’s disease",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other endocrine disorders",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "psychiatry",
		label: "Psychiatric conditions",
		fields: {
			depression: {
				label: "Depression",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			anxiety: {
				label: "Generalized anxiety disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			bipolar: {
				label: "Bipolar disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			schizophrenia: {
				label: "Schizophrenia",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			autism: {
				label: "Autism spectrum disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			adhd: {
				label: "Attention deficit hyperactivity disorder (ADHD)",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other psychiatric disorders",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "gynecology",
		label: "Gynecological history",
		onlyForSex: "female",
		fields: {
			menopause: {
				label: "Menopause",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, provide details" },
			},
			contraception: { label: "Contraception method", type: "string" },
			pcos: {
				label: "Polycystic ovary syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			endometriosis: {
				label: "Endometriosis",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			fibroids: {
				label: "Uterine fibroids",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other gynecological conditions",
				type: "list",
				optional: true,
			},
		},
	},
	{
		key: "obstetrics",
		label: "Obstetric history",
		onlyForSex: "female",
		fields: {
			pregnancies: { label: "Number of pregnancies", type: "number" },
			deliveries: { label: "Number of deliveries", type: "number" },
			c_sections: {
				label: "Number of cesarean sections",
				type: "number",
			},
			ectopic_pregnancy: {
				label: "History of ectopic pregnancy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			gestational_diabetes: {
				label: "Gestational diabetes",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			pregnancy_hypertension: {
				label: "Hypertension during pregnancy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
				commentOnYes: { label: "If yes, provide details" },
			},
			premature_birth: {
				label: "History of premature birth (<37 weeks)",
				type: "choice",
				choices: ["yes", "no"],
				commentOnYes: { label: "If yes, provide details" },
			},
			other: {
				label: "Other obstetric history",
				type: "list",
				optional: true,
			},
		},
	},
];

export const healthCategoryMap = new Map(
	healthCategories.map((category) => [category.key, category]),
);
