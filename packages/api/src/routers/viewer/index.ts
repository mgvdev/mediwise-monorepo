import { getViewer } from "@mediwise-monorepo/domain";

import { protectedProcedure, router } from "../../index";

export const viewerRouter = router({
	me: protectedProcedure.query(({ ctx }) => {
		return getViewer(ctx.session.user);
	}),
});
