import { Ionicons } from "@expo/vector-icons";
import { env } from "@mediwise-monorepo/env/native";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Button, Spinner, Surface, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

import { applyOpacity } from "@/components/color-utils";
import { Container } from "@/components/container";
import { DocumentsHeader } from "@/components/documents-header";
import { OtpSignIn } from "@/components/otp-sign-in";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

type SelectedAsset = ImagePicker.ImagePickerAsset;

type UploadSource = "camera" | "upload";

type SectionHeaderProps = {
	title: string;
	actionLabel: string;
	onAction?: () => void;
};

function resolveFilename(asset: SelectedAsset) {
	if (asset.fileName) return asset.fileName;
	const uriParts = asset.uri.split("/");
	return uriParts[uriParts.length - 1] || `prescription-${Date.now()}.jpg`;
}

function resolveMimeType(asset: SelectedAsset) {
	return asset.mimeType || "image/jpeg";
}

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="font-semibold text-foreground text-lg">{title}</Text>
			<Pressable onPress={onAction} className="px-2 py-1">
				<Text className="font-medium text-primary text-sm">{actionLabel}</Text>
			</Pressable>
		</View>
	);
}

export default function DocumentsScreen() {
	const { data: session } = authClient.useSession();
	const [asset, setAsset] = useState<SelectedAsset | null>(null);
	const [uploadSource, setUploadSource] = useState<UploadSource | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [permissionError, setPermissionError] = useState<
		"camera" | "library" | null
	>(null);

	const prescriptions = useQuery({
		...trpc.prescriptions.list.queryOptions(),
		enabled: !!session?.user,
		refetchInterval: session?.user ? 5000 : false,
	});

	const accentUpload = useThemeColor("success");
	const accentScan = useThemeColor("warning");

	const filteredPrescriptions = useMemo(() => {
		if (!prescriptions.data) return [];
		const query = searchQuery.trim().toLowerCase();
		if (!query) return prescriptions.data;
		return prescriptions.data.filter((item) =>
			item.filename.toLowerCase().includes(query),
		);
	}, [prescriptions.data, searchQuery]);

	const processedCount =
		prescriptions.data?.filter((item) => item.status === "completed").length ??
		0;
	const pendingCount = (prescriptions.data?.length ?? 0) - processedCount;

	const requestCameraPermission = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "camera");
		return allowed;
	};

	const requestLibraryPermission = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		const allowed = status === ImagePicker.PermissionStatus.GRANTED;
		setPermissionError(allowed ? null : "library");
		return allowed;
	};

	const handlePickFromLibrary = async () => {
		setError(null);
		const allowed = await requestLibraryPermission();
		if (!allowed) {
			setError("Photo library permission is required.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.8,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("upload");
		}
	};

	const handleTakePhoto = async () => {
		setError(null);
		const allowed = await requestCameraPermission();
		if (!allowed) {
			setError("Camera permission is required.");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			quality: 0.8,
		});

		if (!result.canceled) {
			setAsset(result.assets[0]);
			setUploadSource("camera");
		}
	};

	const handleUpload = async (source: UploadSource) => {
		if (!asset) {
			setError("Select or capture a prescription image first.");
			return;
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
				setError("Upload failed. Please try again.");
				return;
			}

			setAsset(null);
			setUploadSource(null);
			queryClient.invalidateQueries();
		} catch (uploadError) {
			console.error(uploadError);
			setError("Upload failed. Please try again.");
		} finally {
			setIsUploading(false);
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

	if (!session?.user) {
		return (
			<Container className="p-6">
				<View className="mb-6 py-4">
					<Text className="mb-2 font-bold text-3xl text-foreground">
						Documents
					</Text>
					<Text className="text-muted text-sm">
						Sign in to upload and track prescriptions.
					</Text>
				</View>
				<OtpSignIn />
			</Container>
		);
	}

	return (
		<Container className="gap-4 pb-6">
			<DocumentsHeader
				searchQuery={searchQuery}
				onSearchQueryChange={setSearchQuery}
				onPickFromLibrary={handlePickFromLibrary}
				onTakePhoto={handleTakePhoto}
			/>
			{error && !asset ? (
				<View className="px-6">
					<Text className="text-danger text-xs">{error}</Text>
				</View>
			) : null}
			{permissionError ? (
				<View className="px-6">
					<Surface variant="secondary" className="rounded-2xl p-4">
						<Text className="font-medium text-foreground text-sm">
							{permissionError === "camera"
								? "Camera access needed"
								: "Photo library access needed"}
						</Text>
						<Text className="mt-1 text-muted text-xs">
							Enable access to continue. You can retry or open system settings.
						</Text>
						<View className="mt-3 flex-row gap-2">
							<Button variant="secondary" onPress={handlePermissionRetry}>
								<Button.Label>Try again</Button.Label>
							</Button>
							<Button onPress={() => Linking.openSettings()}>
								<Button.Label>Open settings</Button.Label>
							</Button>
						</View>
					</Surface>
				</View>
			) : null}

			{asset ? (
				<View className="px-6">
					<Surface variant="secondary" className="rounded-2xl p-4">
						<Text className="font-medium text-foreground text-sm">
							Prescription preview
						</Text>
						<Text className="text-muted text-xs">
							Confirm before sending for extraction.
						</Text>
						<View className="mt-3 gap-2">
							<Image
								source={{ uri: asset.uri }}
								className="h-40 w-full rounded-xl"
								resizeMode="cover"
							/>
							<Button
								onPress={() => handleUpload(uploadSource ?? "upload")}
								isDisabled={isUploading}
							>
								{isUploading ? (
									<Spinner size="sm" color="default" />
								) : (
									<Button.Label>Send for processing</Button.Label>
								)}
							</Button>
						</View>
						{error ? (
							<Text className="mt-3 text-danger text-xs">{error}</Text>
						) : null}
					</Surface>
				</View>
			) : null}

			<View className="gap-3 px-6">
				<SectionHeader
					title="Prescription unifie"
					actionLabel="See All"
					onAction={() => prescriptions.refetch()}
				/>
				<Surface variant="secondary" className="rounded-2xl p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-1 items-center gap-2">
							<View
								className="items-center justify-center rounded-full p-3"
								style={{
									borderWidth: 1,
									borderColor: applyOpacity(accentUpload, 0.4) ?? accentUpload,
									backgroundColor:
										applyOpacity(accentUpload, 0.12) ?? "transparent",
								}}
							>
								<Ionicons name="checkmark" size={18} color={accentUpload} />
							</View>
							<Text className="font-semibold text-foreground text-xl">
								{processedCount ?? 0}
							</Text>
							<Text className="text-muted text-xs">Processed</Text>
						</View>
						<View className="h-10 w-px bg-border/60" />
						<View className="flex-1 items-center gap-2">
							<View
								className="items-center justify-center rounded-full p-3"
								style={{
									borderWidth: 1,
									borderColor: applyOpacity(accentScan, 0.4) ?? accentScan,
									backgroundColor:
										applyOpacity(accentScan, 0.12) ?? "transparent",
								}}
							>
								<Ionicons name="alert" size={18} color={accentScan} />
							</View>
							<Text className="font-semibold text-foreground text-xl">
								{pendingCount}
							</Text>
							<Text className="text-muted text-xs">In progress</Text>
						</View>
					</View>
					<Pressable className="mt-4 items-center rounded-full border border-border/60 py-2">
						<Text className="font-semibold text-primary text-sm">
							See unified prescriptions
						</Text>
					</Pressable>
				</Surface>
			</View>

			<View className="px-6">
				<Surface variant="secondary" className="rounded-2xl p-4">
					<View className="flex-row items-center justify-between">
						<Text className="font-medium text-foreground text-sm">
							Recent uploads
						</Text>
						<Button variant="ghost" onPress={() => prescriptions.refetch()}>
							<Button.Label>Refresh</Button.Label>
						</Button>
					</View>

					<View className="mt-3 gap-3">
						{prescriptions.isLoading ? (
							<Text className="text-muted text-xs">Loading...</Text>
						) : filteredPrescriptions.length ? (
							filteredPrescriptions.map((item) => (
								<View
									key={item.rawId}
									className="rounded-xl border border-border/60 bg-surface/40 p-3"
								>
									<Text className="font-medium text-foreground text-sm">
										{item.filename}
									</Text>
									<Text className="text-[11px] text-muted">
										{new Date(item.createdAt).toLocaleString()}
									</Text>
									<View className="mt-2 flex-row items-center justify-between">
										<Text className="text-[11px] text-muted">
											{item.medicationSummary
												? `First med: ${item.medicationSummary}`
												: "Processing"}
										</Text>
										<Text className="font-semibold text-[11px] text-muted">
											{item.status.toUpperCase()}
										</Text>
									</View>
								</View>
							))
						) : (
							<Text className="text-muted text-xs">
								{searchQuery.trim()
									? "No prescriptions match your search."
									: "No uploads yet."}
							</Text>
						)}
					</View>
				</Surface>
			</View>
		</Container>
	);
}
