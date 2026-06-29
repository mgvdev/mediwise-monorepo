import { Ionicons } from "@expo/vector-icons";
import { Surface, useThemeColor } from "heroui-native";
import { Pressable, RefreshControl, TextInput, View } from "react-native";

import {
	BodyMedium,
	Caption,
	Micro,
	MicroStrong,
} from "@/components/base/typography";
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
				<Caption>Review every upload and unified record in one place.</Caption>
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
						<BodyMedium>All prescriptions</BodyMedium>
						<Caption>{filteredPrescriptions.length} total</Caption>
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
										className="border-border/60 bg-surface/40 rounded-xl border p-3"
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
									: "No prescriptions yet."}
							</Caption>
						)}
					</View>
				</Surface>
			</View>
		</Container>
	);
}
