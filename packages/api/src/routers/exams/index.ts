import { protectedProcedure, router } from "../../index";
import {
	examByRawInput,
	examIdInput,
	examListInput,
	examSaveInput,
} from "./dto";
import {
	deleteExam,
	getExam,
	getExamByRaw,
	getExamScan,
	listExams,
	saveExam,
} from "./services";

export const examsRouter = router({
	list: protectedProcedure
		.input(examListInput.optional())
		.query(async ({ ctx, input }) => {
			return listExams({
				userId: ctx.session.user.id,
				search: input?.search ?? null,
			});
		}),
	get: protectedProcedure.input(examIdInput).query(async ({ ctx, input }) => {
		return getExam({ userId: ctx.session.user.id, id: input.id });
	}),
	getByRaw: protectedProcedure
		.input(examByRawInput)
		.query(async ({ ctx, input }) => {
			return getExamByRaw({ userId: ctx.session.user.id, rawId: input.rawId });
		}),
	scan: protectedProcedure.input(examIdInput).query(async ({ ctx, input }) => {
		return getExamScan({ userId: ctx.session.user.id, id: input.id });
	}),
	save: protectedProcedure
		.input(examSaveInput)
		.mutation(async ({ ctx, input }) => {
			return saveExam({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(examIdInput)
		.mutation(async ({ ctx, input }) => {
			return deleteExam({ userId: ctx.session.user.id, id: input.id });
		}),
});
