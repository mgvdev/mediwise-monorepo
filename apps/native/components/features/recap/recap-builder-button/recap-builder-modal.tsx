import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SafeAreaSheet } from "@/components/base/safe-area-sheet";

import { RecapEmailForm } from "./recap-email-form";
import { RecapQRCode } from "./recap-qr-code";
import { RecapSectionPicker } from "./recap-section-picker";
import { RecapShareOptions } from "./recap-share-options";
import type { RecapMethod, RecapSection, RecapSelection } from "./recap-types";

const QR_PLACEHOLDER_VALUE = "mediwise-recap";

type RecapBuilderModalProps = {
	open: boolean;
	onClose: () => void;
	sections: RecapSection[];
	selectedIds: string[];
	onSelectedIdsChange: (next: string[]) => void;
	onComplete?: (selection: RecapSelection) => void;
};

export function RecapBuilderModal({
	open,
	onClose,
	sections,
	selectedIds,
	onSelectedIdsChange,
	onComplete,
}: RecapBuilderModalProps) {
	const [step, setStep] = useState<"sections" | "share">("sections");
	const [method, setMethod] = useState<RecapMethod | null>(null);
	const [email, setEmail] = useState("");

	const toggleSection = (id: string) => {
		if (selectedIds.includes(id)) {
			onSelectedIdsChange(selectedIds.filter((item) => item !== id));
			return;
		}
		onSelectedIdsChange([...selectedIds, id]);
	};

	const handleFinish = () => {
		if (!method) return;
		const selection: RecapSelection = {
			sectionIds: selectedIds,
			method,
			email: method === "pdf" ? email : undefined,
		};
		onComplete?.(selection);
		onClose();
	};

	return (
		<SafeAreaSheet visible={open} onClose={onClose}>
			<View className="border-panel-border bg-panel-background h-full border px-6 pt-5">
				<View className="mb-4 flex-row items-center justify-between">
					<Text className="text-foreground text-lg font-semibold">
						Build your recap
					</Text>
					<Pressable
						className="bg-surface/60 h-9 w-9 items-center justify-center rounded-full"
						onPress={onClose}
					>
						<Ionicons name="close" size={18} className="text-foreground" />
					</Pressable>
				</View>

				{step === "sections" ? (
					<View className="gap-4">
						<Text className="text-muted text-sm">
							Choose the information you want to include in your recap.
						</Text>
						<RecapSectionPicker
							sections={sections}
							selectedIds={selectedIds}
							onToggle={toggleSection}
						/>
						<Button
							className="mt-2"
							isDisabled={selectedIds.length === 0}
							onPress={() => setStep("share")}
						>
							<Button.Label>Continue</Button.Label>
						</Button>
					</View>
				) : (
					<View className="gap-5">
						<RecapShareOptions value={method} onChange={setMethod} />
						{method === "qr" ? (
							<RecapQRCode value={QR_PLACEHOLDER_VALUE} />
						) : null}
						{method === "pdf" ? (
							<RecapEmailForm
								email={email}
								onEmailChange={setEmail}
								onSend={handleFinish}
								disabled={!email.trim().length}
							/>
						) : null}
						<View className="flex-row items-center gap-3">
							<Button variant="secondary" onPress={() => setStep("sections")}>
								<Button.Label>Back</Button.Label>
							</Button>
							<Button
								className="flex-1"
								isDisabled={!method || (method === "pdf" && !email.trim())}
								onPress={handleFinish}
							>
								<Button.Label>Finish</Button.Label>
							</Button>
						</View>
					</View>
				)}
			</View>
		</SafeAreaSheet>
	);
}
