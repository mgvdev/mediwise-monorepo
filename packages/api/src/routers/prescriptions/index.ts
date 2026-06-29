import { protectedProcedure, router } from "../../index";
import {
	prescriptionDeleteInput,
	prescriptionGetInput,
	prescriptionInput,
	prescriptionUnifiedProfileInput,
	prescriptionUploadInput,
} from "./dto";
import {
	deletePrescription,
	getCurrentTreatmentsView,
	getInteractions,
	getPrescription,
	getUnifiedView,
	listPrescriptions,
	savePrescription,
	updateUnifiedProfile,
	uploadPrescription,
} from "./services";

export const prescriptionsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return listPrescriptions({ userId: ctx.session.user.id, limit: 20 });
	}),
	listAll: protectedProcedure.query(async ({ ctx }) => {
		return listPrescriptions({ userId: ctx.session.user.id });
	}),
	get: protectedProcedure
		.input(prescriptionGetInput)
		.query(async ({ ctx, input }) => {
			return getPrescription({ userId: ctx.session.user.id, input });
		}),
	upload: protectedProcedure
		.input(prescriptionUploadInput)
		.mutation(async ({ ctx, input }) => {
			return uploadPrescription({ user: ctx.session.user, input });
		}),
	save: protectedProcedure
		.input(prescriptionInput)
		.mutation(async ({ ctx, input }) => {
			return savePrescription({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(prescriptionDeleteInput)
		.mutation(async ({ ctx, input }) => {
			return deletePrescription({ userId: ctx.session.user.id, input });
		}),
	unified: router({
		get: protectedProcedure.query(async ({ ctx }) => {
			return getUnifiedView({ userId: ctx.session.user.id });
		}),
		current: protectedProcedure.query(async ({ ctx }) => {
			return getCurrentTreatmentsView({ userId: ctx.session.user.id });
		}),
		interactions: protectedProcedure.query(async ({ ctx }) => {
			return getInteractions({ userId: ctx.session.user.id });
		}),
		updateProfile: protectedProcedure
			.input(prescriptionUnifiedProfileInput)
			.mutation(async ({ ctx, input }) => {
				return updateUnifiedProfile({
					userId: ctx.session.user.id,
					input,
				});
			}),
	}),
});
