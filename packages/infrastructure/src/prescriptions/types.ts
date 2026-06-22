export type PrescriptionStatus =
    | "queued"
    | "processing"
    | "completed"
    | "failed";

export type PrescriptionSource = "upload" | "camera";

export type PrescriptionEntrySource = PrescriptionSource | "manual";

export type FrequencyUnit = "day" | "week" | "month";
export type DurationUnit = "day" | "week" | "month";
export type DurationType = "one_off" | "chronic";

export type PrescriptionRawDoc = {
    _id: string;
    userId: string;
    tenantId: string | null;
    source: PrescriptionSource;
    storageKey: string;
    originalFilename: string;
    contentType: string;
    size: number;
    status: PrescriptionStatus;
    error?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type UnifiedMedication = {
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
    refills?: string | null;
    instructions?: string | null;
};

export type UnifiedPrescriptionData = {
    patientName?: string | null;
    prescriberName?: string | null;
    issuedDate?: string | null;
    validUntil?: string | null;
    medications: UnifiedMedication[];
    notes?: string | null;
};

export type PrescriptionUnifiedDoc = {
    _id: string;
    rawId?: string | null;
    userId: string;
    tenantId: string | null;
    provider: string;
    model: string;
    source: PrescriptionEntrySource;
    data: UnifiedPrescriptionData;
    createdAt: Date;
    updatedAt?: Date | null;
};

export type PrescriptionSummary = {
    id: string;
    rawId?: string | null;
    source: PrescriptionEntrySource;
    status: PrescriptionStatus;
    createdAt: Date;
    filename: string;
    medicationSummary?: string | null;
};
