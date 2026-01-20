export type FieldType = "string" | "number" | "choice";

export type HealthField = {
	label: string;
	type: FieldType;
	choices?: string[];
};

export type HealthCategory = {
	key: string;
	label: string;
	fields: Record<string, HealthField>;
};

export const healthCategories: HealthCategory[] = [
	{
		key: "personal_information",
		label: "Personal information",
		fields: {
			last_name: { label: "Last name", type: "string" },
			first_name: { label: "First name", type: "string" },
			birth_date: { label: "Date of birth", type: "string" },
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
			normal_blood_pressure: {
				label: "Do you have normal blood pressure?",
				type: "choice",
				choices: ["yes", "no"],
			},
		},
	},
	{
		key: "allergies",
		label: "Allergies",
		fields: {
			details: { label: "Drug or food allergies", type: "string" },
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
			},
			hypertension: {
				label: "Family history of hypertension",
				type: "choice",
				choices: ["yes", "no"],
			},
			heart_disease: {
				label: "Family history of heart disease",
				type: "choice",
				choices: ["yes", "no"],
			},
			cancer: {
				label: "Family history of cancer",
				type: "choice",
				choices: ["yes", "no"],
			},
			cancer_details: {
				label: "Cancer type, relative and age",
				type: "string",
			},
			neurodegenerative: {
				label: "Family history of neurodegenerative diseases",
				type: "choice",
				choices: ["yes", "no"],
			},
			other: { label: "Other family medical history", type: "string" },
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
			},
			details: { label: "Surgical procedures details", type: "string" },
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
			},
			angina: {
				label: "Angina",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			myocardial_infarction: {
				label: "History of myocardial infarction or stent",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			heart_failure: {
				label: "Heart failure",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			arrhythmia: {
				label: "Cardiac arrhythmia",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other cardiovascular conditions", type: "string" },
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
			},
			copd: {
				label: "COPD",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			pulmonary_embolism: {
				label: "Pulmonary embolism",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			emphysema: {
				label: "Emphysema",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			sleep_apnea: {
				label: "Obstructive sleep apnea syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other pulmonary conditions", type: "string" },
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
			},
			epilepsy: {
				label: "Epilepsy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			chronic_migraines: {
				label: "Chronic migraines",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			parkinson: {
				label: "Parkinson’s disease",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			multiple_sclerosis: {
				label: "Multiple sclerosis",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			brain_tumor: {
				label: "History of brain tumor",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other neurological conditions", type: "string" },
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
			},
			hyperthyroidism: {
				label: "Hyperthyroidism",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			cushing: {
				label: "Cushing syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			addison: {
				label: "Addison’s disease",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other endocrine disorders", type: "string" },
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
			},
			anxiety: {
				label: "Generalized anxiety disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			bipolar: {
				label: "Bipolar disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			schizophrenia: {
				label: "Schizophrenia",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			autism: {
				label: "Autism spectrum disorder",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			adhd: {
				label: "Attention deficit hyperactivity disorder (ADHD)",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other psychiatric disorders", type: "string" },
		},
	},
	{
		key: "gynecology",
		label: "Gynecological history",
		fields: {
			menopause: { label: "Menopause", type: "choice", choices: ["yes", "no"] },
			contraception: { label: "Contraception method", type: "string" },
			pcos: {
				label: "Polycystic ovary syndrome",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			endometriosis: {
				label: "Endometriosis",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			fibroids: {
				label: "Uterine fibroids",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			other: { label: "Other gynecological conditions", type: "string" },
		},
	},
	{
		key: "obstetrics",
		label: "Obstetric history",
		fields: {
			pregnancies: { label: "Number of pregnancies", type: "number" },
			deliveries: { label: "Number of deliveries", type: "number" },
			c_sections: { label: "Number of cesarean sections", type: "number" },
			ectopic_pregnancy: {
				label: "History of ectopic pregnancy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			gestational_diabetes: {
				label: "Gestational diabetes",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			pregnancy_hypertension: {
				label: "Hypertension during pregnancy",
				type: "choice",
				choices: ["yes", "no", "suspected"],
			},
			premature_birth: {
				label: "History of premature birth (<37 weeks)",
				type: "choice",
				choices: ["yes", "no"],
			},
			other: { label: "Other obstetric history", type: "string" },
		},
	},
];

export const healthCategoryMap = new Map(
	healthCategories.map((category) => [category.key, category]),
);
