import { env } from "@mediwise-monorepo/env/web";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [emailOTPClient()],
	fetchOptions: {
		headers: {
			"x-mediwise-app": "backoffice",
		},
	},
});
