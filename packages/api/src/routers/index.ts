import { protectedProcedure, publicProcedure, router } from "../index";
import { prescriptionsRouter } from "./prescriptions";

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
});
export type AppRouter = typeof appRouter;
