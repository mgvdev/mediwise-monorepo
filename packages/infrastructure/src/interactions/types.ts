export type InteractionSeverity = "info" | "warning" | "danger";

export type InteractionType = "drug_drug" | "drug_allergy";

export type InteractionSource = "curated" | "ai";

export type InteractionItem = {
	type: InteractionType;
	severity: InteractionSeverity;
	// The two sides of the interaction, as displayed (medication names, or an
	// allergy on side `b` for `drug_allergy`).
	a: string;
	b: string;
	description: string;
	source: InteractionSource;
};

export type InteractionsResult = {
	items: InteractionItem[];
	disclaimer: string;
};

export type InteractionsViewDoc = {
	_id: string;
	userId: string;
	tenantId: string | null;
	updatedAt: Date;
	provider: string;
	model: string;
	items: InteractionItem[];
	disclaimer: string;
};

// Shown on every alert surface. The feature is informational only and never a
// substitute for professional medical advice.
export const INTERACTION_DISCLAIMER =
	"Informations fournies à titre indicatif. Elles ne remplacent pas l'avis d'un médecin ou pharmacien.";
