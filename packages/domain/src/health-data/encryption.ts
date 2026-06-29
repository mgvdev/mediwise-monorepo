import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { env } from "@mediwise-monorepo/env/server";

const ENCRYPTION_TAG = "ENCRYPTION -- ";
const ENCRYPTION_VERSION = "v1";

function getEncryptionKey() {
	if (env.NODE_ENV !== "production") {
		return null;
	}
	const rawKey = env.HEALTH_DATA_ENCRYPTION_KEY;
	if (!rawKey) {
		console.warn(
			"[health-data] HEALTH_DATA_ENCRYPTION_KEY missing; falling back to tag-only encryption.",
		);
		return null;
	}
	const key = Buffer.from(rawKey, "base64");
	if (key.length !== 32) {
		throw new Error("HEALTH_DATA_ENCRYPTION_KEY must be 32 bytes (base64).");
	}
	return key;
}

export function encryptHealthPayload(payload: unknown) {
	const serialized = JSON.stringify(payload);
	const key = getEncryptionKey();
	if (!key) {
		return `${ENCRYPTION_TAG}${serialized}`;
	}
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(serialized, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();
	return [
		ENCRYPTION_VERSION,
		iv.toString("base64"),
		tag.toString("base64"),
		encrypted.toString("base64"),
	].join(":");
}

export function decryptHealthPayload(payload: string | null | undefined) {
	if (!payload) return {};
	if (payload.startsWith(ENCRYPTION_TAG)) {
		const raw = payload.slice(ENCRYPTION_TAG.length);
		return JSON.parse(raw || "{}") as Record<string, unknown>;
	}
	if (!payload.startsWith(`${ENCRYPTION_VERSION}:`)) {
		return {};
	}
	const [, ivB64, tagB64, dataB64] = payload.split(":");
	if (!ivB64 || !tagB64 || !dataB64) {
		return {};
	}
	const key = getEncryptionKey();
	if (!key) {
		return {};
	}
	const decipher = createDecipheriv(
		"aes-256-gcm",
		key,
		Buffer.from(ivB64, "base64"),
	);
	decipher.setAuthTag(Buffer.from(tagB64, "base64"));
	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(dataB64, "base64")),
		decipher.final(),
	]).toString("utf8");
	return JSON.parse(decrypted || "{}") as Record<string, unknown>;
}
