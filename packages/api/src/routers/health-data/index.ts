import { protectedProcedure, router } from "../../index";
import { healthDataSaveInput } from "./dto";
import { getHealthData, saveHealthData } from "./services";

export const healthDataRouter = router({
	get: protectedProcedure.query(({ ctx }) => {
		return getHealthData(ctx.session.user);
	}),
	save: protectedProcedure
		.input(healthDataSaveInput)
		.mutation(({ ctx, input }) => {
			return saveHealthData({ user: ctx.session.user, input });
		}),
});
