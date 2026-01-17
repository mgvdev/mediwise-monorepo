import { randomUUID } from "node:crypto";
import { Questionnaire } from "@mediwise-monorepo/db";
import type { z } from "zod";

import type { questionnaireInput } from "../dto";

type QuestionnaireInput = z.infer<typeof questionnaireInput>;

type SessionUser = {
	id: string;
};

/**
 * Fetch the default questionnaire.
 */
export async function getQuestionnaire() {
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
}

/**
 * Upsert the default questionnaire.
 */
export async function saveQuestionnaire(params: {
	user: SessionUser;
	input: QuestionnaireInput;
}) {
	const { user, input } = params;
	const now = new Date();
	const updated = await Questionnaire.findOneAndUpdate(
		{ key: "default" },
		{
			$set: {
				title: input.title,
				definition: input.definition,
				updatedAt: now,
				updatedBy: user.id,
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
}
