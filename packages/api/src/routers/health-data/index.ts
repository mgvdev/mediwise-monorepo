import {
	completeOnboarding,
	getHealthData,
	saveHealthData,
	setOnboardingStep,
} from "@mediwise-monorepo/domain";
import { protectedProcedure, router } from "../../index";
import { healthDataSaveInput, healthDataSetCurrentInput } from "./dto";

export const healthDataRouter = router({
	get: protectedProcedure.query(({ ctx }) => {
		return getHealthData(ctx.session.user);
	}),
	save: protectedProcedure
		.input(healthDataSaveInput)
		.mutation(({ ctx, input }) => {
			return saveHealthData({ user: ctx.session.user, input });
		}),
	setOnboardingStep: protectedProcedure
		.input(healthDataSetCurrentInput)
		.mutation(({ ctx, input }) => {
			return setOnboardingStep({
				user: ctx.session.user,
				categoryKey: input.categoryKey,
			});
		}),
	completeOnboarding: protectedProcedure.mutation(({ ctx }) => {
		return completeOnboarding({ user: ctx.session.user });
	}),
});
