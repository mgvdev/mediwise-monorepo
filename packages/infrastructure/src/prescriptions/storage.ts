/// <reference types="bun" />
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@mediwise-monorepo/env/server";

export type StoredFile = {
	key: string;
	url?: string | null;
	size: number;
	contentType: string;
};

export type StorageProvider = {
	saveFile: (file: File, options?: { prefix?: string }) => Promise<StoredFile>;
	getFileBuffer: (key: string) => Promise<Buffer>;
};

function resolveUploadDir() {
	return env.UPLOAD_DIR || "uploads";
}

function buildStorageKey(originalName: string, prefix?: string) {
	const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
	const key = `${randomUUID()}-${sanitized}`;
	return prefix ? `${prefix}/${key}` : key;
}

export function createStorageProvider(): StorageProvider {
	return env.STORAGE_DRIVER === "s3" ? createS3Storage() : createLocalStorage();
}

function createLocalStorage(): StorageProvider {
	return {
		saveFile: async (file, options) => {
			const key = buildStorageKey(file.name, options?.prefix);
			const uploadDir = resolveUploadDir();
			const filePath = path.join(uploadDir, key);
			await mkdir(path.dirname(filePath), { recursive: true });
			await Bun.write(filePath, file);
			return {
				key,
				size: file.size,
				contentType: file.type,
				url: null,
			};
		},
		getFileBuffer: async (key) => {
			const uploadDir = resolveUploadDir();
			const filePath = path.join(uploadDir, key);
			const file = Bun.file(filePath);
			return Buffer.from(await file.arrayBuffer());
		},
	};
}

function createS3Storage(): StorageProvider {
	if (
		!env.S3_BUCKET ||
		!env.S3_REGION ||
		!env.S3_ACCESS_KEY_ID ||
		!env.S3_SECRET_ACCESS_KEY
	) {
		throw new Error("Missing S3 configuration for storage provider.");
	}

	const client = new S3Client({
		region: env.S3_REGION,
		credentials: {
			accessKeyId: env.S3_ACCESS_KEY_ID,
			secretAccessKey: env.S3_SECRET_ACCESS_KEY,
		},
	});

	return {
		saveFile: async (file, options) => {
			const key = buildStorageKey(file.name, options?.prefix);
			await client.send(
				new PutObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: key,
					Body: Buffer.from(await file.arrayBuffer()),
					ContentType: file.type,
				}),
			);

			return {
				key,
				size: file.size,
				contentType: file.type,
				url: env.S3_PUBLIC_URL ? `${env.S3_PUBLIC_URL}/${key}` : null,
			};
		},
		getFileBuffer: async (key) => {
			const response = await client.send(
				new GetObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: key,
				}),
			);
			if (!response.Body) {
				throw new Error("S3 object body was empty.");
			}
			const body = response.Body as AsyncIterable<Uint8Array>;
			const chunks: Uint8Array[] = [];
			for await (const chunk of body) {
				chunks.push(chunk);
			}
			return Buffer.from(Buffer.concat(chunks));
		},
	};
}
