import { Ionicons } from "@expo/vector-icons";
import { Surface, useThemeColor } from "heroui-native";
import { Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { Container } from "@/components/layout/container";
import { applyOpacity } from "@/components/utils";
import { usePrescriptionsList } from "@/features/prescriptions/use-prescriptions-list";

export default function PrescriptionsListScreen() {
	const {
		session,
		searchQuery,
		setSearchQuery,
		isRefreshing,
		handleRefresh,
		openPrescription,
		prescriptions,
		filteredPrescriptions,
	} = usePrescriptionsList();

	const baseBackground = useThemeColor("background");
	const baseForeground = useThemeColor("foreground");
	const searchPlaceholder = applyOpacity(baseForeground, 0.4) ?? baseForeground;

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
			<View className="px-6 pt-4">
				<Text className="text-muted text-xs">
					Review every upload and unified record in one place.
				</Text>
				<View
					className="mt-4 flex-row items-center gap-2 rounded-full px-3 py-2"
					style={{
						backgroundColor: baseBackground,
						borderWidth: 1,
						borderColor: applyOpacity(baseForeground, 0.12) ?? baseForeground,
					}}
				>
					<Ionicons name="search" size={18} color={searchPlaceholder} />
					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder="Search prescriptions"
						placeholderTextColor={searchPlaceholder}
						className="flex-1 text-sm"
						style={{ color: baseForeground }}
					/>
				</View>
			</View>

			<View className="px-6">
				<Surface variant="secondary" className="rounded-2xl p-4">
					<View className="flex-row items-center justify-between">
						<Text className="font-medium text-foreground text-sm">
							All prescriptions
						</Text>
						<Text className="text-muted text-xs">
							{filteredPrescriptions.length} total
						</Text>
					</View>

					<View className="mt-3 gap-3">
						{prescriptions.isLoading ? (
							<Text className="text-muted text-xs">Loading...</Text>
						) : filteredPrescriptions.length ? (
							filteredPrescriptions.map((item) => {
								const targetId = item.rawId ?? item.id;
								return (
									<Pressable
										key={item.id}
										onPress={() => openPrescription(targetId)}
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
									</Pressable>
								);
							})
						) : (
							<Text className="text-muted text-xs">
								{searchQuery.trim()
									? "No prescriptions match your search."
									: "No prescriptions yet."}
							</Text>
						)}
					</View>
				</Surface>
			</View>
		</Container>
	);
}
