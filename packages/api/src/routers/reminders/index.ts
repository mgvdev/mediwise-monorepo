import { protectedProcedure, router } from "../../index";
import {
	reminderDeleteInput,
	reminderSettingsInput,
	reminderUpsertInput,
} from "./dto";
import {
	deleteReminderConfig,
	getRemindersView,
	updateReminderSettingsConfig,
	upsertReminderConfig,
} from "./services";

export const remindersRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return getRemindersView({ userId: ctx.session.user.id });
	}),
	upsert: protectedProcedure
		.input(reminderUpsertInput)
		.mutation(async ({ ctx, input }) => {
			return upsertReminderConfig({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(reminderDeleteInput)
		.mutation(async ({ ctx, input }) => {
			return deleteReminderConfig({ userId: ctx.session.user.id, input });
		}),
	updateSettings: protectedProcedure
		.input(reminderSettingsInput)
		.mutation(async ({ ctx, input }) => {
			return updateReminderSettingsConfig({ user: ctx.session.user, input });
		}),
});
