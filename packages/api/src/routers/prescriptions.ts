import {
	findRawById,
	findUnifiedById,
	findUnifiedByRawId,
	listPrescriptionsByUser,
	upsertUnifiedPrescription,
} from "@mediwise-monorepo/infrastructure/prescriptions";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const frequencyUnitSchema = z.enum(["day", "week", "month"]);
const durationUnitSchema = z.enum(["day", "week", "month"]);

const medicationInput = z.object({
	name: z.string().min(1),
	dosage: z.string().optional().nullable(),
	type: z.string().optional().nullable(),
	quantity: z.string().optional().nullable(),
	frequency: z.string().optional().nullable(),
	frequencyCount: z.number().int().min(1).optional().nullable(),
	frequencyUnit: frequencyUnitSchema.optional().nullable(),
	duration: z.string().optional().nullable(),
	durationValue: z.number().int().min(1).optional().nullable(),
	durationUnit: durationUnitSchema.optional().nullable(),
	route: z.string().optional().nullable(),
	instructions: z.string().optional().nullable(),
});

const prescriptionInput = z.object({
	id: z.string().optional().nullable(),
	rawId: z.string().optional().nullable(),
	issuedDate: z.string().optional().nullable(),
	validUntil: z.string().optional().nullable(),
	prescriberName: z.string().optional().nullable(),
	medications: z.array(medicationInput),
	notes: z.string().optional().nullable(),
});

const prescriptionGetInput = z
	.object({
		rawId: z.string().optional(),
		id: z.string().optional(),
	})
	.refine((value) => value.rawId || value.id, {
		message: "rawId or id is required",
	});

export const prescriptionsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return listPrescriptionsByUser({
			userId: ctx.session.user.id,
			limit: 20,
		});
	}),
	listAll: protectedProcedure.query(async ({ ctx }) => {
		return listPrescriptionsByUser({ userId: ctx.session.user.id });
	}),
	get: protectedProcedure
		.input(prescriptionGetInput)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const rawId = input.rawId;
			const id = input.id;

			const raw = rawId ? await findRawById(rawId) : null;
			if (raw && raw.userId !== userId) {
				return null;
			}

			let unified = null;
			if (rawId) {
				unified = await findUnifiedByRawId({ rawId, userId });
			}
			if (!unified && id) {
				unified = await findUnifiedById({ id, userId });
			}

			if (!raw && !unified) return null;

			return {
				raw: raw
					? {
							id: raw._id,
							status: raw.status,
							createdAt: raw.createdAt,
							filename: raw.originalFilename,
							source: raw.source,
						}
					: null,
				unified: unified
					? {
							id: unified._id,
							rawId: unified.rawId ?? null,
							source: unified.source ?? "manual",
							data: unified.data,
							createdAt: unified.createdAt,
							updatedAt: unified.updatedAt ?? null,
						}
					: null,
			};
		}),
	save: protectedProcedure
		.input(prescriptionInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const raw = input.rawId ? await findRawById(input.rawId) : null;
			if (raw && raw.userId !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid prescription reference.",
				});
			}

			const existing =
				input.id && !input.rawId
					? await findUnifiedById({ id: input.id, userId })
					: input.rawId
						? await findUnifiedByRawId({ rawId: input.rawId, userId })
						: null;

			if (input.id && !existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Prescription not found.",
				});
			}

			const source = raw?.source ?? existing?.source ?? "manual";
			const provider = existing?.provider ?? "manual";
			const model = existing?.model ?? "manual";
			const tenantId =
				raw?.tenantId ??
				existing?.tenantId ??
				("tenantId" in ctx.session.user
					? (ctx.session.user.tenantId ?? null)
					: null);

			const doc = await upsertUnifiedPrescription({
				id: input.id,
				rawId: input.rawId ?? existing?.rawId ?? null,
				userId,
				tenantId,
				source,
				provider,
				model,
				data: {
					prescriberName: input.prescriberName ?? null,
					issuedDate: input.issuedDate ?? null,
					validUntil: input.validUntil ?? null,
					medications: input.medications.map((medication) => ({
						name: medication.name,
						dosage: medication.dosage ?? null,
						type: medication.type ?? null,
						quantity: medication.quantity ?? null,
						frequency: medication.frequency ?? null,
						frequencyCount: medication.frequencyCount ?? null,
						frequencyUnit: medication.frequencyUnit ?? null,
						duration: medication.duration ?? null,
						durationValue: medication.durationValue ?? null,
						durationUnit: medication.durationUnit ?? null,
						route: medication.route ?? null,
						instructions: medication.instructions ?? null,
					})),
					notes: input.notes ?? null,
				},
			});

			return {
				id: doc._id,
				rawId: doc.rawId ?? null,
				updatedAt: doc.updatedAt ?? null,
			};
		}),
});
