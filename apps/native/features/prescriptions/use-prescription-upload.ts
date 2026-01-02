import { env } from "@mediwise-monorepo/env/native";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import type { SelectedAsset, UploadSource } from "./types";

type UploadOptions = {
	intent?: "manual";
	onSuccess?: (id: string) => void;
	missingAssetMessage?: string;
	failureMessage?: string;
};

type UploadResult = { id?: string };

function resolveFilename(asset: SelectedAsset) {
	if (asset.fileName) return asset.fileName;
	const uriParts = asset.uri.split("/");
	return uriParts[uriParts.length - 1] || `prescription-${Date.now()}.jpg`;
}

function resolveMimeType(asset: SelectedAsset) {
	return asset.mimeType || "image/jpeg";
}

export function usePrescriptionUpload(options: UploadOptions = {}) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const upload = async (
		asset: SelectedAsset | null,
		source: UploadSource | null,
	) => {
		if (!asset || !source) {
			setError(
				options.missingAssetMessage ??
					"Select or capture a prescription image first.",
			);
			return null;
		}

		setError(null);
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", {
				uri: asset.uri,
				name: resolveFilename(asset),
				type: resolveMimeType(asset),
			} as never);
			formData.append("source", source);
			if (options.intent) {
				formData.append("intent", options.intent);
			}

			const headers: Record<string, string> = {};
			const cookies = authClient.getCookie();
			if (cookies) {
				headers.Cookie = cookies;
			}

			const response = await fetch(
				`${env.EXPO_PUBLIC_SERVER_URL}/api/prescriptions/upload`,
				{
					method: "POST",
					body: formData,
					headers,
				},
			);

			if (!response.ok) {
				setError(options.failureMessage ?? "Upload failed. Please try again.");
				return null;
			}

			const data = (await response.json()) as UploadResult;
			if (data.id) {
				options.onSuccess?.(data.id);
				return data.id;
			}
			return null;
		} catch (uploadError) {
			console.error(uploadError);
			setError(options.failureMessage ?? "Upload failed. Please try again.");
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	const clearError = () => setError(null);

	return { upload, isUploading, error, clearError };
}
