import { protectedProcedure, router } from "../../index";
import {
	appointmentIdInput,
	appointmentListInput,
	appointmentSaveInput,
} from "./dto";
import {
	deleteAppointment,
	getAppointment,
	getAppointmentSchedule,
	listAppointments,
	saveAppointment,
} from "./services";

export const appointmentsRouter = router({
	list: protectedProcedure
		.input(appointmentListInput.optional())
		.query(async ({ ctx, input }) => {
			return listAppointments({
				userId: ctx.session.user.id,
				practitionerId: input?.practitionerId ?? null,
			});
		}),
	get: protectedProcedure
		.input(appointmentIdInput)
		.query(async ({ ctx, input }) => {
			return getAppointment({ userId: ctx.session.user.id, id: input.id });
		}),
	schedule: protectedProcedure.query(async ({ ctx }) => {
		return getAppointmentSchedule({ userId: ctx.session.user.id });
	}),
	save: protectedProcedure
		.input(appointmentSaveInput)
		.mutation(async ({ ctx, input }) => {
			return saveAppointment({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(appointmentIdInput)
		.mutation(async ({ ctx, input }) => {
			return deleteAppointment({ userId: ctx.session.user.id, id: input.id });
		}),
});
