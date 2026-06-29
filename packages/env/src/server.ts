import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

const corsOriginSchema = z
	.string()
	.min(1)
	.refine((value) => {
		return value
			.split(",")
			.map((origin) => origin.trim())
			.filter(Boolean)
			.every((origin) => z.string().url().safeParse(origin).success);
	}, "CORS_ORIGIN must be a comma-separated list of URLs");

const parseCorsOrigins = (value: string) =>
	value
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);

const parseDomainList = (value: string | undefined) =>
	(value ?? "")
		.split(",")
		.map((domain) => domain.trim().toLowerCase())
		.filter(Boolean);

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: corsOriginSchema,
		ADMIN_DOMAINS: z.string().optional(),
		UPLOAD_DIR: z.string().default("uploads"),
		STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
		S3_BUCKET: z.string().optional(),
		S3_REGION: z.string().optional(),
		S3_ACCESS_KEY_ID: z.string().optional(),
		S3_SECRET_ACCESS_KEY: z.string().optional(),
		S3_PUBLIC_URL: z.string().optional(),
		AI_PROVIDER: z.enum(["ollama", "openai"]).default("ollama"),
		OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
		OLLAMA_MODEL: z.string().default("gemma3:4b"),
		OLLAMA_TIMEOUT_MS: z.coerce.number().default(120000),
		OPENAI_API_KEY: z.string().optional(),
		OPENAI_MODEL: z.string().default("gpt-4o-mini"),
		HEALTH_DATA_ENCRYPTION_KEY: z.string().optional(),
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

export const corsOrigins = parseCorsOrigins(env.CORS_ORIGIN);
export const adminDomains = parseDomainList(env.ADMIN_DOMAINS);
