import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { examsRouter } from "./exams";
import { healthDataRouter } from "./health-data";
import { prescriptionsRouter } from "./prescriptions";
import { questionnaireRouter } from "./questionnaire";
import { remindersRouter } from "./reminders";
import { viewerRouter } from "./viewer";

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
	reminders: remindersRouter,
	viewer: viewerRouter,
	admin: adminRouter,
});
export type AppRouter = typeof appRouter;
