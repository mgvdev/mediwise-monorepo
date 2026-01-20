import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Spinner, Surface, useThemeColor } from "heroui-native";
import { Image, Linking, Pressable, RefreshControl, View } from "react-native";
import {
	BodyMedium,
	Caption,
	H2,
	H3,
	Link,
	Micro,
	MicroStrong,
} from "@/components/base/typography";
import { DocumentsHeader } from "@/components/features/prescription/documents-header";
import { PrescriptionDetailDialog } from "@/components/features/prescription/prescription-dialogs";
import { Container } from "@/components/layout/container";
import { applyOpacity } from "@/components/utils";
import { useDocumentsScreen } from "@/features/documents/use-documents-screen";

type SectionHeaderProps = {
	title: string;
	actionLabel: string;
	onAction?: () => void;
};

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
	return (
		<View className="flex-row items-center justify-between">
			<H3>{title}</H3>
			<Pressable onPress={onAction} className="px-2 py-1">
				<Link>{actionLabel}</Link>
			</Pressable>
		</View>
	);
}

export default function DocumentsScreen() {
	const {
		session,
		searchQuery,
		setSearchQuery,
		detailOpen,
		setDetailOpen,
		selectedPrescriptionId,
		setSelectedPrescriptionId,
		isRefreshing,
		error,
		permissionError,
		asset,
		uploadSource,
		handlePickFromLibrary,
		handleTakePhoto,
		handlePermissionRetry,
		handleUpload,
		openPrescription,
		handleRefresh,
		prescriptions,
		filteredPrescriptions,
		processedCount,
		pendingCount,
		isUploading,
	} = useDocumentsScreen();

	const accentUpload = useThemeColor("success");
	const accentScan = useThemeColor("warning");

	if (!session?.user) {
		return null;
	}

	return (
		<Container
			className="gap-4 pb-6"
			scrollProps={{
				refreshControl: (
					<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
				),
			}}
		>
			<DocumentsHeader
				searchQuery={searchQuery}
				onSearchQueryChange={setSearchQuery}
				onPickFromLibrary={handlePickFromLibrary}
				onTakePhoto={handleTakePhoto}
				onAddManual={() => router.push("/prescriptions/new")}
			/>
			{error && !asset ? (
				<View className="px-6">
					<Caption className="text-danger">{error}</Caption>
				</View>
			) : null}
			{permissionError ? (
				<View className="px-6">
					<Surface variant="secondary" className="rounded-2xl p-4">
						<BodyMedium>
							{permissionError === "camera"
								? "Camera access needed"
								: "Photo library access needed"}
						</BodyMedium>
						<Caption className="mt-1">
							Enable access to continue. You can retry or open system settings.
						</Caption>
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
						<BodyMedium>Prescription preview</BodyMedium>
						<Caption>Confirm before sending for extraction.</Caption>
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
							<Caption className="mt-3 text-danger">{error}</Caption>
						) : null}
					</Surface>
				</View>
			) : null}

			<View className="gap-3 px-6">
				<SectionHeader
					title="Prescription unifie"
					actionLabel="See All"
					onAction={() => router.push("/prescriptions")}
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
							<H2>{processedCount ?? 0}</H2>
							<Caption>Processed</Caption>
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
							<H2>{pendingCount}</H2>
							<Caption>In progress</Caption>
						</View>
					</View>
					<Pressable
						onPress={() => router.push("/prescriptions")}
						className="mt-4 items-center rounded-full border border-border/60 py-2"
					>
						<Link>See unified prescriptions</Link>
					</Pressable>
				</Surface>
			</View>

			<View className="px-6">
				<Surface variant="secondary" className="rounded-2xl p-4">
					<View className="flex-row items-center justify-between">
						<BodyMedium>Recent uploads</BodyMedium>
						<Button variant="ghost" onPress={() => prescriptions.refetch()}>
							<Button.Label>Refresh</Button.Label>
						</Button>
					</View>

					<View className="mt-3 gap-3">
						{prescriptions.isLoading ? (
							<Caption>Loading...</Caption>
						) : filteredPrescriptions.length ? (
							filteredPrescriptions.map((item) => {
								const targetId = item.rawId ?? item.id;
								return (
									<Pressable
										key={item.id}
										onPress={() => openPrescription(targetId)}
										className="rounded-xl border border-border/60 bg-surface/40 p-3"
									>
										<BodyMedium>{item.filename}</BodyMedium>
										<Micro>{new Date(item.createdAt).toLocaleString()}</Micro>
										<View className="mt-2 flex-row items-center justify-between">
											<Micro>
												{item.medicationSummary
													? `First med: ${item.medicationSummary}`
													: "Processing"}
											</Micro>
											<MicroStrong>{item.status.toUpperCase()}</MicroStrong>
										</View>
									</Pressable>
								);
							})
						) : (
							<Caption>
								{searchQuery.trim()
									? "No prescriptions match your search."
									: "No uploads yet."}
							</Caption>
						)}
					</View>
				</Surface>
			</View>

			<PrescriptionDetailDialog
				isOpen={detailOpen}
				onOpenChange={(open) => {
					setDetailOpen(open);
					if (!open) setSelectedPrescriptionId(null);
				}}
				prescriptionId={selectedPrescriptionId}
				onSaved={() => {
					prescriptions.refetch();
				}}
			/>
		</Container>
	);
}
