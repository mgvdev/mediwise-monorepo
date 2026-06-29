import type { InteractionSeverity } from "./types";

// Curated, deterministic interaction reference. Intentionally small but
// high-confidence: only well-established, clinically significant pairs. Each
// entry carries a traceable `source`. This is NOT exhaustive — the LLM layer
// adds informational coverage on top.

export type DrugDrugRule = {
	// Lowercase ASCII keywords matched against a normalized medication name.
	// Any keyword in `a` paired with any keyword in `b` triggers the rule.
	a: string[];
	b: string[];
	severity: InteractionSeverity;
	description: string;
	source: string;
};

export type AllergyRule = {
	// Lowercase ASCII keywords matched against a normalized allergy entry.
	allergen: string[];
	// Medication keywords belonging to the same class / cross-reactive group.
	drugKeywords: string[];
	severity: InteractionSeverity;
	description: string;
	source: string;
};

export const DRUG_DRUG_RULES: DrugDrugRule[] = [
	{
		a: ["warfarine", "warfarin", "coumadine"],
		b: [
			"aspirine",
			"aspirin",
			"acide acetylsalicylique",
			"ibuprofene",
			"ibuprofen",
			"naproxene",
			"naproxen",
			"ketoprofene",
			"diclofenac",
		],
		severity: "danger",
		description:
			"Anticoagulant (warfarine) + AINS/aspirine : risque hémorragique majoré.",
		source: "ANSM — anticoagulants oraux",
	},
	{
		a: ["warfarine", "warfarin", "coumadine"],
		b: ["amiodarone", "fluconazole", "miconazole", "metronidazole"],
		severity: "danger",
		description:
			"Potentialisation de la warfarine : risque hémorragique (surveillance INR).",
		source: "ANSM — anticoagulants oraux",
	},
	{
		a: ["methotrexate", "methotrexat"],
		b: [
			"aspirine",
			"aspirin",
			"ibuprofene",
			"ibuprofen",
			"naproxene",
			"naproxen",
			"ketoprofene",
			"diclofenac",
			"triméthoprime",
			"trimethoprime",
			"cotrimoxazole",
			"bactrim",
		],
		severity: "danger",
		description:
			"Méthotrexate + AINS/triméthoprime : toxicité hématologique accrue.",
		source: "ANSM — méthotrexate",
	},
	{
		a: ["simvastatine", "simvastatin", "atorvastatine", "atorvastatin"],
		b: [
			"clarithromycine",
			"clarithromycin",
			"erythromycine",
			"itraconazole",
			"ketoconazole",
			"gemfibrozil",
		],
		severity: "warning",
		description:
			"Statine + inhibiteur enzymatique : risque accru de myopathie/rhabdomyolyse.",
		source: "ANSM — statines",
	},
	{
		a: [
			"ains",
			"ibuprofene",
			"ibuprofen",
			"naproxene",
			"naproxen",
			"ketoprofene",
			"diclofenac",
		],
		b: [
			"enalapril",
			"ramipril",
			"lisinopril",
			"perindopril",
			"captopril",
			"losartan",
			"valsartan",
			"candesartan",
			"irbesartan",
		],
		severity: "warning",
		description:
			"AINS + IEC/ARA2 : baisse de l'efficacité antihypertensive et risque rénal.",
		source: "ANSM — AINS",
	},
	{
		a: [
			"fluoxetine",
			"paroxetine",
			"sertraline",
			"citalopram",
			"escitalopram",
			"venlafaxine",
			"duloxetine",
		],
		b: [
			"tramadol",
			"triptan",
			"sumatriptan",
			"linezolide",
			"linezolid",
			"millepertuis",
		],
		severity: "danger",
		description:
			"Sérotoninergiques associés : risque de syndrome sérotoninergique.",
		source: "ANSM — antidépresseurs",
	},
	{
		a: [
			"ains",
			"ibuprofene",
			"ibuprofen",
			"naproxene",
			"naproxen",
			"ketoprofene",
			"diclofenac",
			"corticoide",
			"prednisone",
			"prednisolone",
		],
		b: ["aspirine", "aspirin", "acide acetylsalicylique"],
		severity: "warning",
		description:
			"AINS/corticoïde + aspirine : risque accru d'ulcère et de saignement digestif.",
		source: "ANSM — AINS",
	},
	{
		a: ["spironolactone", "amiloride", "eplerenone"],
		b: [
			"enalapril",
			"ramipril",
			"lisinopril",
			"perindopril",
			"captopril",
			"losartan",
			"valsartan",
			"candesartan",
			"potassium",
		],
		severity: "warning",
		description:
			"Épargneur potassique + IEC/ARA2/potassium : risque d'hyperkaliémie.",
		source: "ANSM — diurétiques",
	},
];

export const ALLERGY_RULES: AllergyRule[] = [
	{
		allergen: [
			"penicilline",
			"penicillin",
			"amoxicilline",
			"amoxicillin",
			"beta-lactamine",
			"betalactamine",
		],
		drugKeywords: [
			"amoxicilline",
			"amoxicillin",
			"ampicilline",
			"penicilline",
			"penicillin",
			"augmentin",
			"clavulanique",
			"piperacilline",
			"cefalexine",
			"cephalosporine",
			"ceftriaxone",
			"cefuroxime",
		],
		severity: "danger",
		description:
			"Allergie aux pénicillines/bêta-lactamines : éviter ce médicament de la même classe.",
		source: "Allergie déclarée — bêta-lactamines",
	},
	{
		allergen: ["sulfamide", "sulfonamide", "sulfa", "bactrim", "cotrimoxazole"],
		drugKeywords: [
			"sulfamethoxazole",
			"cotrimoxazole",
			"bactrim",
			"sulfasalazine",
			"sulfadiazine",
		],
		severity: "danger",
		description:
			"Allergie aux sulfamides : éviter ce médicament de la même classe.",
		source: "Allergie déclarée — sulfamides",
	},
	{
		allergen: [
			"aspirine",
			"aspirin",
			"ains",
			"ibuprofene",
			"ibuprofen",
			"anti-inflammatoire",
		],
		drugKeywords: [
			"aspirine",
			"aspirin",
			"ibuprofene",
			"ibuprofen",
			"naproxene",
			"naproxen",
			"ketoprofene",
			"diclofenac",
			"celecoxib",
		],
		severity: "warning",
		description: "Allergie/intolérance aux AINS : risque de réaction croisée.",
		source: "Allergie déclarée — AINS",
	},
	{
		allergen: ["codeine", "morphine", "opioide", "opiace", "tramadol"],
		drugKeywords: [
			"codeine",
			"morphine",
			"tramadol",
			"oxycodone",
			"fentanyl",
			"hydromorphone",
		],
		severity: "warning",
		description:
			"Allergie/intolérance aux opioïdes : prudence avec ce médicament de la même classe.",
		source: "Allergie déclarée — opioïdes",
	},
];
