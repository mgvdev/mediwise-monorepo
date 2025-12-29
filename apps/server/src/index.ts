import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@mediwise-monorepo/api/context";
import { appRouter } from "@mediwise-monorepo/api/routers/index";
import { auth } from "@mediwise-monorepo/auth";
import { env } from "@mediwise-monorepo/env/server";
import {
	createJob,
	createRawPrescription,
	createStorageProvider,
} from "@mediwise-monorepo/infrastructure/prescriptions";
import { convertToModelMessages, streamText, wrapLanguageModel } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.post("/api/prescriptions/upload", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const formData = await c.req.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return c.json({ error: "File is required." }, 400);
	}

	if (!file.type.startsWith("image/")) {
		return c.json({ error: "Only image uploads are supported for now." }, 400);
	}

	const storage = createStorageProvider();
	const stored = await storage.saveFile(file, { prefix: session.user.id });
	const sourceValue = formData.get("source");
	const source = sourceValue === "camera" ? "camera" : "upload";
	const tenantId =
		"tenantId" in session.user ? (session.user.tenantId ?? null) : null;

	const raw = await createRawPrescription({
		userId: session.user.id,
		tenantId,
		source,
		storageKey: stored.key,
		originalFilename: file.name,
		contentType: file.type,
		size: file.size,
	});

	await createJob({
		rawId: raw._id,
		provider: env.AI_PROVIDER,
		model: env.AI_PROVIDER === "openai" ? env.OPENAI_MODEL : env.OLLAMA_MODEL,
	});

	return c.json({ id: raw._id, status: raw.status });
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.post("/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const model = wrapLanguageModel({
		model: google("gemini-2.5-flash"),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(uiMessages),
	});

	return result.toUIMessageStreamResponse();
});

app.get("/", (c) => {
	return c.text("OK");
});

console.info(`[server] Mediwise API initialized (${env.NODE_ENV}).`);

export default app;
