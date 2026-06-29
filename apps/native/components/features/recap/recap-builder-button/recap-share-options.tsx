import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import type { RecapMethod } from "./recap-types";

type RecapShareOptionsProps = {
	value: RecapMethod | null;
	onChange: (next: RecapMethod) => void;
	className?: string;
};

export function RecapShareOptions({
	value,
	onChange,
	className,
}: RecapShareOptionsProps) {
	return (
		<View className={cn("gap-3", className)}>
			<Pressable
				className={cn(
					"border-panel-border bg-panel-background rounded-2xl border px-4 py-3",
					value === "qr" && "border-primary bg-primary/10",
				)}
				onPress={() => onChange("qr")}
			>
				<Text className="text-foreground text-sm font-semibold">Share QR</Text>
				<Text className="text-muted text-xs">
					Generate a QR code for your doctor to scan.
				</Text>
			</Pressable>
			<Pressable
				className={cn(
					"border-panel-border bg-panel-background rounded-2xl border px-4 py-3",
					value === "pdf" && "border-primary bg-primary/10",
				)}
				onPress={() => onChange("pdf")}
			>
				<Text className="text-foreground text-sm font-semibold">Email PDF</Text>
				<Text className="text-muted text-xs">
					Send a PDF recap to a contact.
				</Text>
			</Pressable>
		</View>
	);
}
