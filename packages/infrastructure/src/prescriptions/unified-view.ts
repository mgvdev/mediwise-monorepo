import {
    PrescriptionUnified,
    PrescriptionUnifiedView,
} from "@mediwise-monorepo/db";
import { env } from "@mediwise-monorepo/env/server";

import { createJob, dropQueuedJobsForUser } from "../jobs/repository";
import { JobTypes } from "../jobs/types";
import type {
    DurationType,
    DurationUnit,
    FrequencyUnit,
    PrescriptionEntrySource,
    PrescriptionUnifiedDoc,
} from "./types";

export type UnifiedViewMedication = {
    name: string;
    dosage?: string | null;
    frequency?: string | null;
    frequencyCount?: number | null;
    frequencyUnit?: FrequencyUnit | null;
    route?: string | null;
    durationType?: DurationType | null;
    duration?: string | null;
    durationValue?: number | null;
    durationUnit?: DurationUnit | null;
    instructions?: string | null;
    form?: string | null;
    intakeMoments?: string[] | null;
    startDate?: string | null;
    endDate?: string | null;
    status: "active" | "ended";
    sources: { id: string; rawId?: string | null }[];
};

export type UnifiedViewSource = {
    id: string;
    rawId?: string | null;
    source: PrescriptionEntrySource;
    issuedDate?: string | null;
    prescriberName?: string | null;
    createdAt: Date;
    updatedAt?: Date | null;
};

export type UnifiedViewProfile = {
    dateOfBirth?: string | null;
    heightCm?: number | null;
    heightUnit?: "cm" | "inch" | null;
    weightKg?: number | null;
    weightUnit?: "kg" | "lbs" | null;
    symptoms: string[];
    conditions: string[];
    history: string[];
    allergies: string[];
    lifelongTreatments: string[];
    notes?: string | null;
};

export type UnifiedPrescriptionViewDoc = {
    _id: string;
    userId: string;
    tenantId: string | null;
    updatedAt: Date;
    prescriptions: UnifiedViewSource[];
    medications: UnifiedViewMedication[];
    profile: UnifiedViewProfile;
};

const emptyProfile: UnifiedViewProfile = {
    dateOfBirth: null,
    heightCm: null,
    heightUnit: "cm",
    weightKg: null,
    weightUnit: "kg",
    symptoms: [],
    conditions: [],
    history: [],
    allergies: [],
    lifelongTreatments: [],
    notes: null,
};

function normalizeName(value: string) {
    return value.trim().toLowerCase();
}

function addDuration(date: Date, value: number, unit: DurationUnit) {
    const copy = new Date(date.getTime());
    switch (unit) {
        case "day":
            copy.setDate(copy.getDate() + value);
            break;
        case "week":
            copy.setDate(copy.getDate() + value * 7);
            break;
        case "month":
            copy.setMonth(copy.getMonth() + value);
            break;
        default:
            break;
    }
    return copy;
}

function computeEndDate(input: {
    issuedDate?: string | null;
    validUntil?: string | null;
    durationType?: DurationType | null;
    durationValue?: number | null;
    durationUnit?: DurationUnit | null;
}) {
    if (input.durationType === "chronic") {
        return null;
    }
    if (input.issuedDate && input.durationValue && input.durationUnit) {
        const issued = new Date(input.issuedDate);
        if (!Number.isNaN(issued.getTime())) {
            return addDuration(
                issued,
                input.durationValue,
                input.durationUnit,
            ).toISOString();
        }
    }
    if (input.validUntil) {
        const until = new Date(input.validUntil);
        if (!Number.isNaN(until.getTime())) {
            return until.toISOString();
        }
    }
    return null;
}

function resolveStatus(endDate: string | null) {
    if (!endDate) return "active";
    const date = new Date(endDate);
    if (Number.isNaN(date.getTime())) return "active";
    return date.getTime() >= Date.now() ? "active" : "ended";
}

function buildMedicationKey(medication: {
    name: string;
    dosage?: string | null;
}) {
    const dosage = medication.dosage
        ? medication.dosage.trim().toLowerCase()
        : "";
    return `${normalizeName(medication.name)}::${dosage}`;
}

function buildSources(unified: PrescriptionUnifiedDoc[]): UnifiedViewSource[] {
    return unified.map((doc) => ({
        id: doc._id,
        rawId: doc.rawId ?? null,
        source: doc.source ?? "manual",
        issuedDate: doc.data.issuedDate ?? null,
        prescriberName: doc.data.prescriberName ?? null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt ?? null,
    }));
}

function buildMedications(unified: PrescriptionUnifiedDoc[]) {
    const map = new Map<string, UnifiedViewMedication>();

    for (const doc of unified) {
        for (const medication of doc.data.medications ?? []) {
            if (!medication?.name) continue;

            const key = buildMedicationKey({
                name: medication.name,
                dosage: medication.dosage ?? null,
            });
            const endDate = computeEndDate({
                issuedDate: doc.data.issuedDate ?? null,
                validUntil: doc.data.validUntil ?? null,
                durationType: medication.durationType ?? null,
                durationValue: medication.durationValue ?? null,
                durationUnit: medication.durationUnit ?? null,
            });
            const status = resolveStatus(endDate);

            const existing = map.get(key);
            if (existing) {
                existing.sources.push({
                    id: doc._id,
                    rawId: doc.rawId ?? null,
                });
                if (!existing.endDate && endDate) {
                    existing.endDate = endDate;
                    existing.status = status;
                }
                if (!existing.form && medication.form) {
                    existing.form = medication.form;
                }
                if (
                    (!existing.intakeMoments ||
                        existing.intakeMoments.length === 0) &&
                    medication.intakeMoments?.length
                ) {
                    existing.intakeMoments = medication.intakeMoments;
                }
                continue;
            }

            map.set(key, {
                name: medication.name,
                dosage: medication.dosage ?? null,
                frequency: medication.frequency ?? null,
                frequencyCount: medication.frequencyCount ?? null,
                frequencyUnit: medication.frequencyUnit ?? null,
                route: medication.route ?? null,
                durationType: medication.durationType ?? null,
                duration: medication.duration ?? null,
                durationValue: medication.durationValue ?? null,
                durationUnit: medication.durationUnit ?? null,
                instructions: medication.instructions ?? null,
                form: medication.form ?? null,
                intakeMoments: medication.intakeMoments ?? null,
                startDate: doc.data.issuedDate ?? null,
                endDate,
                status,
                sources: [{ id: doc._id, rawId: doc.rawId ?? null }],
            });
        }
    }

    return Array.from(map.values());
}

/**
 * Fetch the unified prescription view for a user.
 */
export async function getUnifiedViewByUser(userId: string) {
    return PrescriptionUnifiedView.findOne({
        userId,
    }).lean<UnifiedPrescriptionViewDoc | null>();
}

/**
 * Update user-editable profile data inside the unified view.
 */
export async function updateUnifiedViewProfile(input: {
    userId: string;
    profile: Partial<UnifiedViewProfile>;
}) {
    const existing = await PrescriptionUnifiedView.findOne({
        userId: input.userId,
    }).lean<UnifiedPrescriptionViewDoc | null>();

    const mergedProfile: UnifiedViewProfile = {
        ...emptyProfile,
        ...(existing?.profile ?? {}),
        ...input.profile,
    };

    const now = new Date();
    const updated = await PrescriptionUnifiedView.findOneAndUpdate(
        { userId: input.userId },
        {
            $set: {
                profile: mergedProfile,
                updatedAt: now,
            },
            $setOnInsert: {
                _id: input.userId,
                userId: input.userId,
                tenantId: null,
                prescriptions: [],
                medications: [],
            },
        },
        { upsert: true, new: true },
    ).lean<UnifiedPrescriptionViewDoc | null>();

    return updated;
}

/**
 * Recompute and persist the unified view from all unified prescriptions.
 */
export async function recomputeUnifiedView(userId: string) {
    const allUnified = await PrescriptionUnified.find({ userId })
        .sort({ createdAt: -1 })
        .lean<PrescriptionUnifiedDoc[]>();

    // Keep medical reports / compte-rendus out of the prescription view.
    const unified = allUnified.filter(
        (doc) => doc.data?.documentType !== "report",
    );

    const existing = await PrescriptionUnifiedView.findOne({
        userId,
    }).lean<UnifiedPrescriptionViewDoc | null>();

    const prescriptions = buildSources(unified);
    const medications = buildMedications(unified);
    const tenantId =
        unified.find((doc) => doc.tenantId)?.tenantId ??
        existing?.tenantId ??
        null;

    const doc: UnifiedPrescriptionViewDoc = {
        _id: userId,
        userId,
        tenantId,
        updatedAt: new Date(),
        prescriptions,
        medications,
        profile: existing?.profile ?? emptyProfile,
    };

    await PrescriptionUnifiedView.findOneAndUpdate(
        { userId },
        { $set: doc },
        { upsert: true },
    );

    // The medication set changed: (re)queue an async drug-interaction analysis.
    // Debounced so at most one analysis is pending per user.
    await dropQueuedJobsForUser({
        type: JobTypes.interactionAnalysis,
        userId,
    });
    await createJob({
        type: JobTypes.interactionAnalysis,
        payload: {
            userId,
            provider: env.AI_PROVIDER,
            model:
                env.AI_PROVIDER === "openai"
                    ? env.OPENAI_MODEL
                    : env.OLLAMA_MODEL,
        },
    });

    return doc;
}
