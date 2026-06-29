import {
	PrescriptionInteractionsView,
	PrescriptionUnifiedView,
} from "@mediwise-monorepo/db";
import { getHealthData } from "@mediwise-monorepo/domain";
import { createInteractionAnalyzer } from "./ai";
import { matchCuratedInteractions } from "./matcher";
import {
	INTERACTION_DISCLAIMER,
	type InteractionItem,
	type InteractionSeverity,
	type InteractionsViewDoc,
} from "./types";

type UnifiedViewLean = {
	tenantId?: string | null;
	medications?: Array<{ name?: string | null; status?: "active" | "ended" }>;
};

const SEVERITY_RANK: Record<InteractionSeverity, number> = {
	info: 0,
	warning: 1,
	danger: 2,
};

function dedupeKey(item: InteractionItem) {
	const sides = [
		item.a.toLowerCase().trim(),
		item.b.toLowerCase().trim(),
	].sort();
	return `${item.type}|${sides.join("|")}`;
}

/**
 * Merge curated (authoritative) and AI (informational) items. On a duplicate
 * pair, the curated item wins, but it inherits the higher severity of the two.
 */
function mergeItems(
	curated: InteractionItem[],
	ai: InteractionItem[],
): InteractionItem[] {
	const byKey = new Map<string, InteractionItem>();

	for (const item of [...curated, ...ai]) {
		const key = dedupeKey(item);
		const existing = byKey.get(key);
		if (!existing) {
			byKey.set(key, item);
			continue;
		}
		// Prefer curated source; keep the most severe rating seen.
		const winner = existing.source === "curated" ? existing : item;
		const severity =
			SEVERITY_RANK[item.severity] > SEVERITY_RANK[existing.severity]
				? item.severity
				: existing.severity;
		byKey.set(key, { ...winner, severity });
	}

	return [...byKey.values()].sort(
		(x, y) => SEVERITY_RANK[y.severity] - SEVERITY_RANK[x.severity],
	);
}

function extractActiveMedicationNames(view: UnifiedViewLean | null): string[] {
	if (!view?.medications?.length) return [];
	return view.medications
		.filter((m) => m.status !== "ended")
		.map((m) => (typeof m.name === "string" ? m.name.trim() : ""))
		.filter((name) => name.length > 0);
}

function extractAllergies(data: Record<string, unknown> | undefined): string[] {
	const allergies = data?.allergies as { details?: unknown } | undefined;
	const details = allergies?.details;
	if (!Array.isArray(details)) return [];
	return details
		.map((value) => (typeof value === "string" ? value.trim() : ""))
		.filter((value) => value.length > 0);
}

/**
 * Recompute and persist the drug-interaction view for a user. Runs the curated
 * matcher (always) and the LLM analyzer (best-effort — failures degrade to
 * curated-only). Safe to call repeatedly; it upserts one doc per user.
 */
export async function analyzeAndPersistInteractions(
	userId: string,
): Promise<InteractionsViewDoc> {
	const analyzer = createInteractionAnalyzer();

	const view = await PrescriptionUnifiedView.findOne({
		userId,
	}).lean<UnifiedViewLean | null>();
	const medications = extractActiveMedicationNames(view);

	const health = await getHealthData({ id: userId });
	const allergies = extractAllergies(
		health.data as Record<string, unknown> | undefined,
	);

	const curated = matchCuratedInteractions({ medications, allergies });

	let ai: InteractionItem[] = [];
	// Only worth an LLM call when there is something to reason about.
	if (medications.length > 0) {
		try {
			ai = await analyzer.analyzeInteractions({ medications, allergies });
		} catch (error) {
			// Informational layer is best-effort; keep curated results on failure.
			console.error("Interaction LLM analysis failed:", error);
		}
	}

	const items = mergeItems(curated, ai);

	const doc: InteractionsViewDoc = {
		_id: userId,
		userId,
		tenantId: view?.tenantId ?? null,
		updatedAt: new Date(),
		provider: analyzer.provider,
		model: analyzer.model,
		items,
		disclaimer: INTERACTION_DISCLAIMER,
	};

	await PrescriptionInteractionsView.findOneAndUpdate(
		{ userId },
		{ $set: doc },
		{ upsert: true },
	);

	return doc;
}

export async function getInteractionsView(
	userId: string,
): Promise<InteractionsViewDoc | null> {
	return PrescriptionInteractionsView.findOne({
		userId,
	}).lean<InteractionsViewDoc | null>();
}
