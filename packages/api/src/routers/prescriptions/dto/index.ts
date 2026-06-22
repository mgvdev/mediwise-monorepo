import { z } from "zod";

export const frequencyUnitSchema = z.enum(["day", "week", "month"]);
export const durationUnitSchema = z.enum(["day", "week", "month"]);
export const uploadSourceSchema = z.enum(["camera", "upload"]);

export const medicationInput = z.object({
    name: z.string().min(1),
    dosage: z.string().optional().nullable(),
    frequency: z.string().optional().nullable(),
    frequencyCount: z.number().int().min(1).optional().nullable(),
    frequencyUnit: frequencyUnitSchema.optional().nullable(),
    durationType: z.enum(["one_off", "chronic"]).optional().nullable(),
    duration: z.string().optional().nullable(),
    durationValue: z.number().int().min(1).optional().nullable(),
    durationUnit: durationUnitSchema.optional().nullable(),
    route: z.string().optional().nullable(),
    instructions: z.string().optional().nullable(),
});

export const prescriptionInput = z.object({
    id: z.string().optional().nullable(),
    rawId: z.string().optional().nullable(),
    issuedDate: z.string().optional().nullable(),
    validUntil: z.string().optional().nullable(),
    prescriberName: z.string().optional().nullable(),
    medications: z.array(medicationInput),
    notes: z.string().optional().nullable(),
});

export const prescriptionUploadInput = z.object({
    filename: z.string().min(1),
    contentType: z.string().min(1),
    base64: z.string().min(1),
    source: uploadSourceSchema,
    intent: z.enum(["manual"]).optional(),
});

export const prescriptionUnifiedProfileInput = z.object({
    dateOfBirth: z.string().optional().nullable(),
    heightCm: z.number().int().min(30).max(260).optional().nullable(),
    heightUnit: z.enum(["cm", "inch"]).optional(),
    weightKg: z.number().int().min(20).max(400).optional().nullable(),
    weightUnit: z.enum(["kg", "lbs"]).optional(),
    symptoms: z.array(z.string().min(1)).optional(),
    conditions: z.array(z.string().min(1)).optional(),
    history: z.array(z.string().min(1)).optional(),
    allergies: z.array(z.string().min(1)).optional(),
    lifelongTreatments: z.array(z.string().min(1)).optional(),
    notes: z.string().optional().nullable(),
});

export const prescriptionGetInput = z
    .object({
        rawId: z.string().optional(),
        id: z.string().optional(),
    })
    .refine((value) => value.rawId || value.id, {
        message: "rawId or id is required",
    });
