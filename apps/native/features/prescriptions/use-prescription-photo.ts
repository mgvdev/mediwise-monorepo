import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Linking } from "react-native";

import type { SelectedAsset, UploadSource } from "./types";

type PermissionError = "camera" | "library" | null;

export function usePrescriptionPhoto() {
	const [asset, setAsset] = useState<SelectedAsset | null>(null);
	const [extraAssets, setExtraAssets] = useState<SelectedAsset[]>([]);
	const [uploadSource, setUploadSource] = useState<UploadSource | null>(null);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [permissionError, setPermissionError] = useState<PermissionError>(null);

	const showPermissionAlert = (
		type: "camera" | "library",
		canAskAgain: boolean | undefined,
		onRetry: () => void,
	) => {
		const title =
			type === "camera"
				? "Camera access needed"
				: "Photo library access needed";
		const message =
			type === "camera"
				? "Enable camera access to scan prescriptions."
				: "Enable photo library access to upload prescriptions.";
		const actions = [];
		if (canAskAgain ?? true) {
			actions.push({ text: "Try again", onPress: onRetry });
		}
		actions.push({
			text: "Open settings",
			onPress: () => Linking.openSettings(),
		});
		actions.push({ text: "Cancel", style: "cancel" as const });
		Alert.alert(title, message, actions);
	};

	const requestCameraPermission = async () => {
		const { status, canAskAgain } =
			await ImagePicker.requestCameraPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "camera");
		if (!allowed) {
			showPermissionAlert("camera", canAskAgain, requestCameraPermission);
		}
		return allowed;
	};

	const requestLibraryPermission = async () => {
		const { status, canAskAgain } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "library");
		if (!allowed) {
			showPermissionAlert("library", canAskAgain, requestLibraryPermission);
		}
		return allowed;
	};

	const handlePickFromLibrary = async () => {
		setPhotoError(null);
		const allowed = await requestLibraryPermission();
		if (!allowed) {
			setPhotoError("Photo library permission is required.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("upload");
		}
	};

	const handleTakePhoto = async () => {
		setPhotoError(null);
		const allowed = await requestCameraPermission();
		if (!allowed) {
			setPhotoError("Camera permission is required.");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("camera");
		}
	};

	const handlePermissionRetry = async () => {
		if (permissionError === "camera") {
			await requestCameraPermission();
		}
		if (permissionError === "library") {
			await requestLibraryPermission();
		}
	};

	// Add extra pages (multi-page document) from the library, multi-select.
	const handleAddPage = async () => {
		setPhotoError(null);
		const allowed = await requestLibraryPermission();
		if (!allowed) {
			setPhotoError("Photo library permission is required.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled) {
			setExtraAssets((prev) => [...prev, ...result.assets]);
		}
	};

	const removeExtraAsset = (index: number) => {
		setExtraAssets((prev) => prev.filter((_, i) => i !== index));
	};

	const resetPhoto = () => {
		setAsset(null);
		setExtraAssets([]);
		setUploadSource(null);
	};

	return {
		asset,
		extraAssets,
		uploadSource,
		photoError,
		permissionError,
		setPhotoError,
		setPermissionError,
		handlePickFromLibrary,
		handleTakePhoto,
		handleAddPage,
		removeExtraAsset,
		handlePermissionRetry,
		resetPhoto,
	};
}
