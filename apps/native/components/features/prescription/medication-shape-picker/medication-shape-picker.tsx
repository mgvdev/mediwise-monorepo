import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	MedicationShape,
	type MedicationShapeId,
} from "@/components/features/prescription/medication-shape";
import {
	MEDICATION_SHAPE_GROUPS_EN,
	SHAPE_LABELS_EN,
} from "@/components/features/prescription/medication-shape/medication-shape.constants";

type MedicationShapePickerProps = {
	value: MedicationShapeId;
	onChange: (next: MedicationShapeId) => void;
	label?: string;
	showValueLabel?: boolean;
	className?: string;
};

export function MedicationShapePicker({
	value,
	onChange,
	showValueLabel = true,
	className,
}: MedicationShapePickerProps) {
	const [open, setOpen] = React.useState(false);
	const insets = useSafeAreaInsets();
	const currentLabel = SHAPE_LABELS_EN[value];

	return (
		<View className={cn("gap-3", className)}>
			<Pressable
				className="self-start rounded-2xl border border-panel-border bg-panel-background px-3 py-3"
				onPress={() => setOpen(true)}
				accessibilityRole="button"
				accessibilityLabel="Choose medication shape"
			>
				<View className="items-center gap-2">
					<View className="relative">
						<MedicationShape
							shape={value}
							label={currentLabel}
							showLabel={showValueLabel}
							size={56}
							iconSize={28}
						/>
						<View className="absolute -top-1 -right-1 rounded-full border border-panel-border bg-panel-background p-1">
							<Ionicons name="chevron-down" size={14} className="text-muted" />
						</View>
					</View>
				</View>
			</Pressable>

			<Modal visible={open} transparent animationType="slide">
				<View className="flex-1 justify-end bg-black/30">
					<View
						className="rounded-t-3xl border border-panel-border bg-panel-background px-5 pt-4 pb-6"
						style={{
							maxHeight: "85%",
							paddingBottom: Math.max(insets.bottom, 16),
						}}
					>
						<View className="flex-row items-center justify-between">
							<Text className="font-semibold text-base text-foreground">
								Select a shape
							</Text>
							<Pressable
								onPress={() => setOpen(false)}
								className="h-8 w-8 items-center justify-center rounded-full border border-panel-border"
							>
								<Ionicons name="close" size={16} className="text-muted" />
							</Pressable>
						</View>

						<ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
							<View className="gap-5">
								{MEDICATION_SHAPE_GROUPS_EN.map((group) => (
									<View key={group.title} className="gap-3">
										<Text className="font-semibold text-foreground text-sm">
											{group.title}
										</Text>
										<View className="flex-row flex-wrap gap-4">
											{group.items.map((shape) => (
												<Pressable
													key={shape}
													onPress={() => {
														onChange(shape);
														setOpen(false);
													}}
													className={cn(
														"rounded-2xl border border-panel-border bg-panel-background px-2 py-2",
														shape === value && "border-primary bg-primary/10",
													)}
												>
													<MedicationShape
														shape={shape}
														label={SHAPE_LABELS_EN[shape]}
														size={72}
														iconSize={34}
													/>
												</Pressable>
											))}
										</View>
									</View>
								))}
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export type { MedicationShapeId };
