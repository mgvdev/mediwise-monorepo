import { protectedProcedure, router } from "../../index";
import { questionnaireInput } from "./dto";
import { getQuestionnaire, saveQuestionnaire } from "./services";

export const questionnaireRouter = router({
	get: protectedProcedure.query(async () => {
		return getQuestionnaire();
	}),
	save: protectedProcedure
		.input(questionnaireInput)
		.mutation(async ({ ctx, input }) => {
			return saveQuestionnaire({ user: ctx.session.user, input });
		}),
});
