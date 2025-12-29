import { randomUUID } from "node:crypto";
import { Questionnaire } from "@mediwise-monorepo/db";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const questionnaireInput = z.object({
	title: z.string().min(1),
	definition: z.unknown(),
});

export const questionnaireRouter = router({
	get: protectedProcedure.query(async () => {
		const doc = await Questionnaire.findOne({ key: "default" }).lean<{
			_id: string;
			title: string;
			definition: unknown;
			updatedAt: Date;
		} | null>();
		if (!doc) return null;
		return {
			id: doc._id,
			title: doc.title,
			definition: doc.definition,
			updatedAt: doc.updatedAt,
		};
	}),
	save: protectedProcedure
		.input(questionnaireInput)
		.mutation(async ({ ctx, input }) => {
			const now = new Date();
			const updated = await Questionnaire.findOneAndUpdate(
				{ key: "default" },
				{
					$set: {
						title: input.title,
						definition: input.definition,
						updatedAt: now,
						updatedBy: ctx.session.user.id,
					},
					$setOnInsert: {
						_id: randomUUID(),
						key: "default",
						createdAt: now,
					},
				},
				{ upsert: true, new: true },
			).lean<{ _id: string; title: string; updatedAt: Date } | null>();

			return {
				id: updated?._id ?? null,
				title: input.title,
				updatedAt: updated?.updatedAt ?? now,
			};
		}),
});
