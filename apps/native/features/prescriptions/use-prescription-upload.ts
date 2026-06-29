import { useState } from "react";

import { trpcClient } from "@/utils/trpc";

import type { SelectedAsset, UploadSource } from "./types";

type UploadOptions = {
	intent?: "manual";
	onSuccess?: (id: string) => void;
	missingAssetMessage?: string;
	failureMessage?: string;
};

type UploadResult = { id: string; status: string };

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
		extraAssets: SelectedAsset[] = [],
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
			if (!asset.base64) {
				setError(
					options.failureMessage ??
						"Upload failed. Please select the image again.",
				);
				return null;
			}

			const additionalPages = extraAssets
				.filter((page) => !!page.base64)
				.map((page) => ({
					filename: resolveFilename(page),
					contentType: resolveMimeType(page),
					base64: page.base64 as string,
				}));

			const data = (await trpcClient.mutation("prescriptions.upload", {
				filename: resolveFilename(asset),
				contentType: resolveMimeType(asset),
				base64: asset.base64,
				source,
				intent: options.intent,
				additionalPages: additionalPages.length ? additionalPages : undefined,
			})) as UploadResult;

			options.onSuccess?.(data.id);
			return data.id;
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
