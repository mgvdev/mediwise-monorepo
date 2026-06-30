import { router } from "expo-router";
import { Button, Spinner, Surface } from "heroui-native";
import { Image, Linking, Pressable, RefreshControl, View } from "react-native";

import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/base/card";
import {
	BodyMedium,
	BodyMuted,
	Caption,
	Link,
	Micro,
	MicroStrong,
} from "@/components/base/typography";
import { DocumentsHeader } from "@/components/features/prescription/documents-header";
import { PrescriptionDetailDialog } from "@/components/features/prescription/prescription-dialogs";
import { UnifiedPrescriptionEmpty } from "@/components/features/prescription/unified-prescription-empty/unified-prescription-empty";
import { TabScreen } from "@/components/layout/tab-screen";
import { pressableFeedback } from "@/components/utils";
import { useDocumentsScreen } from "@/features/documents/use-documents-screen";

export default function DocumentsScreen() {
	const {
		session,
		detailOpen,
		setDetailOpen,
		selectedPrescriptionId,
		setSelectedPrescriptionId,
		isRefreshing,
		error,
		permissionError,
		asset,
		extraAssets,
		uploadSource,
		handlePickFromLibrary,
		handleTakePhoto,
		handleAddPage,
		removeExtraAsset,
		handlePermissionRetry,
		handleUpload,
		openPrescription,
		handleRefresh,
		prescriptions,
		filteredPrescriptions,
		isUploading,
		treatmentNames,
	} = useDocumentsScreen();

	if (!session?.user) {
		return null;
	}

	return (
		<TabScreen
			scrollProps={{
				contentContainerStyle: { gap: 16 },
				refreshControl: (
					<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
				),
			}}
		>
			<DocumentsHeader
				className="mx-6"
				onPickFromLibrary={handlePickFromLibrary}
				onTakePhoto={handleTakePhoto}
				onAddManual={() => router.push("/prescriptions/new")}
			/>
			{error && !asset ? (
				<Card className="mx-6">
					<CardBody>
						<Caption className="text-danger">{error}</Caption>
					</CardBody>
				</Card>
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
				<Card className="mx-6">
					<CardHeader>
						<CardTitle>Prescription preview</CardTitle>
					</CardHeader>
					<CardBody className="gap-3">
						<Caption>
							Confirm before sending for extraction.
							{extraAssets.length ? ` ${extraAssets.length + 1} pages.` : ""}
						</Caption>
						<Image
							source={{ uri: asset.uri }}
							className="h-40 w-full rounded-xl"
							resizeMode="cover"
						/>
						{extraAssets.length ? (
							<View className="flex-row flex-wrap gap-2">
								{extraAssets.map((page, index) => (
									<Pressable
										key={page.uri}
										onPress={() => removeExtraAsset(index)}
										style={pressableFeedback()}
									>
										<Image
											source={{ uri: page.uri }}
											className="h-16 w-16 rounded-lg"
											resizeMode="cover"
										/>
										<Micro className="text-danger text-center">Remove</Micro>
									</Pressable>
								))}
							</View>
						) : null}
						<Button variant="secondary" onPress={handleAddPage}>
							<Button.Label>Add page</Button.Label>
						</Button>
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
						{error ? <Caption className="text-danger">{error}</Caption> : null}
					</CardBody>
				</Card>
			) : null}

			<Card containerClassName="mx-6" variant="ai">
				<CardHeader>
					<CardTitle>Unified Ordonnance</CardTitle>
					<Pressable
						onPress={() => router.push("/prescriptions/current")}
						className="px-2 py-1"
						style={pressableFeedback()}
					>
						<Link>Open</Link>
					</Pressable>
				</CardHeader>
				<CardBody>
					{treatmentNames.length ? (
						<View className="gap-1">
							<BodyMedium>{treatmentNames.length} active treatments</BodyMedium>
							<Caption>
								{treatmentNames.slice(0, 3).join(", ")}
								{treatmentNames.length > 3
									? ` +${treatmentNames.length - 3} more`
									: ""}
							</Caption>
						</View>
					) : (
						<UnifiedPrescriptionEmpty
							title="No active treatments"
							description="Add a prescription to see current treatments."
						/>
					)}
				</CardBody>
				<CardFooter>
					<BodyMuted>
						Powered by <Link>Mediwise AI</Link>
					</BodyMuted>
				</CardFooter>
			</Card>

			<Pressable
				onPress={() => router.push("/exams")}
				className="mx-6"
				style={pressableFeedback()}
			>
				<Card>
					<CardHeader>
						<CardTitle>Examens & comptes rendus</CardTitle>
						<Link>Ouvrir</Link>
					</CardHeader>
					<CardBody>
						<BodyMuted>
							Résultats d'examens et comptes rendus, classés par date.
						</BodyMuted>
					</CardBody>
				</Card>
			</Pressable>

			<Card className="mx-6">
				<CardHeader>
					<CardTitle>Recent uploads</CardTitle>
					<Pressable
						onPress={() => prescriptions.refetch()}
						className="px-2 py-1"
						style={pressableFeedback()}
					>
						<Link>Refresh</Link>
					</Pressable>
				</CardHeader>
				<CardBody className="gap-3">
					{prescriptions.isLoading ? (
						<Caption>Loading...</Caption>
					) : filteredPrescriptions.length ? (
						filteredPrescriptions.map((item) => {
							const targetId = item.rawId ?? item.id;
							return (
								<Pressable
									key={item.id}
									onPress={() => openPrescription(targetId)}
									className="border-border/60 bg-surface/40 rounded-xl border p-3"
									style={pressableFeedback()}
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
						<Caption>No uploads yet.</Caption>
					)}
				</CardBody>
			</Card>

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
		</TabScreen>
	);
}
