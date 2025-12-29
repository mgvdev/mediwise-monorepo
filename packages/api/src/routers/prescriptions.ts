import { listPrescriptionsByUser } from "@mediwise-monorepo/infrastructure/prescriptions";

import { protectedProcedure, router } from "../index";

export const prescriptionsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return listPrescriptionsByUser({ userId: ctx.session.user.id });
	}),
});
