import { Ionicons } from "@expo/vector-icons";
import { cn, Dialog } from "heroui-native";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
	const currentLabel = SHAPE_LABELS_EN[value];

	return (
		<Dialog isOpen={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Pressable
					className={cn(
						"border-panel-border bg-panel-background self-start rounded-2xl border px-3 py-3",
						className,
					)}
					onPress={() => setOpen(true)}
					accessibilityRole="button"
					accessibilityLabel="Choose medication shape"
					hitSlop={8}
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
							<View className="border-panel-border bg-panel-background absolute -top-1 -right-1 rounded-full border p-1">
								<Ionicons
									name="chevron-down"
									size={14}
									className="text-muted"
								/>
							</View>
						</View>
					</View>
				</Pressable>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content className="border-panel-border bg-panel-background rounded-3xl border px-5 pt-4 pb-6">
					<View className="mb-3 flex-row items-center justify-between">
						<View className="gap-1">
							<Dialog.Title>Select a shape</Dialog.Title>
							<Dialog.Description>
								Choose the closest medication form.
							</Dialog.Description>
						</View>
						<Dialog.Close asChild>
							<Pressable className="border-panel-border h-8 w-8 items-center justify-center rounded-full border">
								<Ionicons name="close" size={16} className="text-muted" />
							</Pressable>
						</Dialog.Close>
					</View>

					<View className="h-[420px]">
						<ScrollView
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{ paddingBottom: 12 }}
						>
							<View className="gap-5">
								{MEDICATION_SHAPE_GROUPS_EN.map((group) => (
									<View key={group.title} className="gap-3">
										<Text className="text-foreground text-sm font-semibold">
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
													hitSlop={8}
													className={cn(
														"border-panel-border bg-panel-background rounded-2xl border px-2 py-2",
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}

export type { MedicationShapeId };
