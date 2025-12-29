import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { prescriptionsRouter } from "./prescriptions";
import { questionnaireRouter } from "./questionnaire";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	prescriptions: prescriptionsRouter,
	questionnaire: questionnaireRouter,
	admin: adminRouter,
});
export type AppRouter = typeof appRouter;
