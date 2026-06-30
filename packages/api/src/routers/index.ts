import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { examsRouter } from "./exams";
import { healthDataRouter } from "./health-data";
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
	healthData: healthDataRouter,
	prescriptions: prescriptionsRouter,
	exams: examsRouter,
	questionnaire: questionnaireRouter,
	admin: adminRouter,
});
export type AppRouter = typeof appRouter;
