import { protectedProcedure, router } from "../../index";
import {
	practitionerIdInput,
	practitionerListInput,
	practitionerSaveInput,
} from "./dto";
import {
	deletePractitioner,
	getPractitioner,
	listPractitioners,
	listPractitionerSuggestions,
	savePractitioner,
} from "./services";

export const practitionersRouter = router({
	list: protectedProcedure
		.input(practitionerListInput.optional())
		.query(async ({ ctx, input }) => {
			return listPractitioners({
				userId: ctx.session.user.id,
				search: input?.search ?? null,
			});
		}),
	get: protectedProcedure
		.input(practitionerIdInput)
		.query(async ({ ctx, input }) => {
			return getPractitioner({ userId: ctx.session.user.id, id: input.id });
		}),
	suggestions: protectedProcedure.query(async ({ ctx }) => {
		return listPractitionerSuggestions({ userId: ctx.session.user.id });
	}),
	save: protectedProcedure
		.input(practitionerSaveInput)
		.mutation(async ({ ctx, input }) => {
			return savePractitioner({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(practitionerIdInput)
		.mutation(async ({ ctx, input }) => {
			return deletePractitioner({ userId: ctx.session.user.id, id: input.id });
		}),
});
