import { z } from "zod";

export const questionnaireInput = z.object({
	title: z.string().min(1),
	definition: z.unknown(),
});
