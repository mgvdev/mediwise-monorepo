import { auth } from "@mediwise-monorepo/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});
	const appId = context.req.raw.headers.get("x-mediwise-app") ?? "member";
	return {
		session,
		appId,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
