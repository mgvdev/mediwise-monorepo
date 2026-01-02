import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { UploadSource } from "@/features/prescriptions/types";
import { usePrescriptionPhoto } from "@/features/prescriptions/use-prescription-photo";
import { usePrescriptionUpload } from "@/features/prescriptions/use-prescription-upload";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export function useDocumentsScreen() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
		string | null
	>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const prescriptions = useQuery({
		...trpc.prescriptions.list.queryOptions(),
		enabled: !!session?.user,
		refetchInterval: session?.user ? 5000 : false,
	});

	const photo = usePrescriptionPhoto();
	const uploader = usePrescriptionUpload();

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

	const handleUpload = async (source: UploadSource) => {
		if (!photo.asset) {
			setUploadError("Select or capture a prescription image first.");
			return;
		}

		setUploadError(null);
		const uploadedId = await uploader.upload(photo.asset, source);
		if (!uploadedId) {
			setUploadError(uploader.error ?? "Upload failed. Please try again.");
			return;
		}

		photo.resetPhoto();
		queryClient.invalidateQueries();
		openPrescription(uploadedId);
	};

	const handlePermissionRetry = async () => {
		await photo.handlePermissionRetry();
	};

	const openPrescription = (id: string) => {
		setSelectedPrescriptionId(id);
		setDetailOpen(true);
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await prescriptions.refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (!session?.user) return;
			prescriptions.refetch();
		}, [prescriptions, session?.user]),
	);

	return {
		session,
		searchQuery,
		setSearchQuery,
		detailOpen,
		setDetailOpen,
		selectedPrescriptionId,
		setSelectedPrescriptionId,
		isRefreshing,
		error: uploadError ?? photo.photoError,
		permissionError: photo.permissionError,
		asset: photo.asset,
		uploadSource: photo.uploadSource,
		handlePickFromLibrary: photo.handlePickFromLibrary,
		handleTakePhoto: photo.handleTakePhoto,
		handlePermissionRetry,
		handleUpload,
		openPrescription,
		handleRefresh,
		prescriptions,
		filteredPrescriptions,
		processedCount,
		pendingCount,
		isUploading: uploader.isUploading,
	};
}
