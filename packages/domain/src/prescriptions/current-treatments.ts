export type CurrentTreatmentMedication = {
	name: string;
	dosage?: string | null;
	frequency?: string | null;
	frequencyCount?: number | null;
	frequencyUnit?: "day" | "week" | "month" | null;
	durationType?: "one_off" | "chronic" | null;
	durationValue?: number | null;
	durationUnit?: "day" | "week" | "month" | null;
	instructions?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	status: "active" | "ended";
};

export type UnifiedViewLike = {
	medications: CurrentTreatmentMedication[];
	updatedAt?: Date | string | null;
};

export function selectCurrentTreatments(medications: CurrentTreatmentMedication[]) {
	return medications.filter((medication) => medication.status === "active");
}

export async function getCurrentTreatments(params: {
	userId: string;
	fetchUnifiedView: (userId: string) => Promise<UnifiedViewLike | null>;
}) {
	const view = await params.fetchUnifiedView(params.userId);
	const medications = view?.medications ?? [];
	return {
		updatedAt: view?.updatedAt ?? null,
		medications: selectCurrentTreatments(medications),
	};
}
