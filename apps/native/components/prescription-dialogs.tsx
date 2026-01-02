import { Dialog } from "heroui-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	ManualPrescriptionForm,
	PrescriptionDetailForm,
} from "@/components/prescription-forms";

type ManualPrescriptionDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved?: (id: string) => void;
};

export function ManualPrescriptionDialog({
	isOpen,
	onOpenChange,
	onSaved,
}: ManualPrescriptionDialogProps) {
	const insets = useSafeAreaInsets();

	return (
		<Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Portal className="justify-end p-0">
				<Dialog.Overlay className="bg-black/40" />
				<Dialog.Content className="rounded-t-3xl border-0 bg-background p-0">
					<View className="items-center pt-3">
						<View className="h-1 w-12 rounded-full bg-border/60" />
					</View>
					<View className="px-6 pt-3">
						<Dialog.Title>Manual prescription</Dialog.Title>
						<Dialog.Description>
							Fill in details or attach a photo for reference.
						</Dialog.Description>
					</View>
					<Dialog.Close className="absolute top-4 right-4" />
					<ScrollView
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: insets.bottom + 24,
							paddingTop: 16,
						}}
						showsVerticalScrollIndicator={false}
					>
						<ManualPrescriptionForm
							onSaved={(id) => {
								onSaved?.(id);
								onOpenChange(false);
							}}
						/>
					</ScrollView>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}

type PrescriptionDetailDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	prescriptionId: string | null;
	onSaved?: () => void;
};

export function PrescriptionDetailDialog({
	isOpen,
	onOpenChange,
	prescriptionId,
	onSaved,
}: PrescriptionDetailDialogProps) {
	const insets = useSafeAreaInsets();

	if (!prescriptionId) return null;

	return (
		<Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Portal className="justify-end p-0">
				<Dialog.Overlay className="bg-black/40" />
				<Dialog.Content className="rounded-t-3xl border-0 bg-background p-0">
					<View className="items-center pt-3">
						<View className="h-1 w-12 rounded-full bg-border/60" />
					</View>
					<View className="px-6 pt-3">
						<Dialog.Title>Unified prescription</Dialog.Title>
						<Dialog.Description>
							Review the extracted info and make any corrections.
						</Dialog.Description>
					</View>
					<Dialog.Close className="absolute top-4 right-4" />
					<ScrollView
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: insets.bottom + 24,
							paddingTop: 16,
						}}
						showsVerticalScrollIndicator={false}
					>
						<PrescriptionDetailForm
							prescriptionId={prescriptionId}
							onSaved={() => {
								onSaved?.();
								onOpenChange(false);
							}}
						/>
					</ScrollView>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
