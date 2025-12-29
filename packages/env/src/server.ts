import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		UPLOAD_DIR: z.string().default("uploads"),
		STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
		S3_BUCKET: z.string().optional(),
		S3_REGION: z.string().optional(),
		S3_ACCESS_KEY_ID: z.string().optional(),
		S3_SECRET_ACCESS_KEY: z.string().optional(),
		S3_PUBLIC_URL: z.string().optional(),
		AI_PROVIDER: z.enum(["ollama", "openai"]).default("ollama"),
		OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
		OLLAMA_MODEL: z.string().default("llava"),
		OPENAI_API_KEY: z.string().optional(),
		OPENAI_MODEL: z.string().default("gpt-4o-mini"),
		JOB_POLL_INTERVAL_MS: z.coerce.number().default(2000),
		JOB_LOCK_TIMEOUT_MS: z.coerce.number().default(120000),
		JOB_MAX_ATTEMPTS: z.coerce.number().default(3),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
