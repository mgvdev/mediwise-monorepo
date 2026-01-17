import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import * as React from "react";
import {
	LayoutAnimation,
	Platform,
	Pressable,
	Text,
	UIManager,
	View,
	type ViewProps,
} from "react-native";

import { DotChip, type DotChipStatus } from "@/components/base/dot-chip";

type MedicalTestReportContextValue = {
	isOpen: boolean;
	toggle: () => void;
};

const MedicalTestReportContext = React.createContext<
	MedicalTestReportContextValue | undefined
>(undefined);

type MedicalTestReportProps = ViewProps & {
	defaultOpen?: boolean;
	isOpen?: boolean;
	onOpenChange?: (next: boolean) => void;
};

export function MedicalTestReport({
	defaultOpen = false,
	isOpen,
	onOpenChange,
	className,
	children,
	...props
}: MedicalTestReportProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
	const open = isOpen ?? uncontrolledOpen;

	React.useEffect(() => {
		if (Platform.OS === "android") {
			UIManager.setLayoutAnimationEnabledExperimental?.(true);
		}
	}, []);

	const toggle = React.useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const next = !open;
		if (isOpen === undefined) {
			setUncontrolledOpen(next);
		}
		onOpenChange?.(next);
	}, [isOpen, onOpenChange, open]);

	return (
		<MedicalTestReportContext.Provider value={{ isOpen: open, toggle }}>
			<View
				className={cn(
					"rounded-3xl border border-panel-border bg-panel-background p-5",
					className,
				)}
				{...props}
			>
				{children}
			</View>
		</MedicalTestReportContext.Provider>
	);
}

type MedicalTestReportHeaderProps = ViewProps & {
	timestamp: string;
	title: string;
	status: DotChipStatus;
	leading?: React.ReactNode;
	statusLabel?: string;
};

export function MedicalTestReportHeader({
	timestamp,
	title,
	status,
	leading,
	statusLabel = status[0]?.toUpperCase() + status.slice(1),
	className,
	...props
}: MedicalTestReportHeaderProps) {
	const ctx = React.useContext(MedicalTestReportContext);
	if (!ctx) {
		throw new Error(
			"MedicalTestReportHeader must be used within MedicalTestReport",
		);
	}

	return (
		<Pressable
			className={cn("flex-row items-center justify-between", className)}
			onPress={ctx.toggle}
			{...props}
		>
			<View className="flex-row items-center gap-4">
				{leading ? (
					<View className="h-12 w-12 items-center justify-center rounded-full border border-panel-border bg-panel-background">
						{leading}
					</View>
				) : null}
				<View className="gap-2">
					<Text className="text-muted text-sm">{timestamp}</Text>
					<Text className="font-semibold text-foreground text-lg">{title}</Text>
					<DotChip status={status} label={statusLabel} />
				</View>
			</View>
			<View className={cn("transition-transform", ctx.isOpen && "rotate-180")}>
				<Ionicons name="chevron-down" size={20} className="text-muted" />
			</View>
		</Pressable>
	);
}

type MedicalTestReportBodyProps = ViewProps;

export function MedicalTestReportBody({
	children,
	className,
	...props
}: MedicalTestReportBodyProps) {
	const ctx = React.useContext(MedicalTestReportContext);
	if (!ctx) {
		throw new Error(
			"MedicalTestReportBody must be used within MedicalTestReport",
		);
	}

	if (!ctx.isOpen) return null;

	return (
		<View
			className={cn("mt-4 border-border/60 border-t pt-4", className)}
			{...props}
		>
			{children}
		</View>
	);
}

type MedicalTestReportFooterProps = ViewProps;

export function MedicalTestReportFooter({
	children,
	className,
	...props
}: MedicalTestReportFooterProps) {
	const ctx = React.useContext(MedicalTestReportContext);
	if (!ctx) {
		throw new Error(
			"MedicalTestReportFooter must be used within MedicalTestReport",
		);
	}

	if (!ctx.isOpen) return null;

	return (
		<View
			className={cn(
				"mt-4 items-center border-border/60 border-t pt-4",
				className,
			)}
			{...props}
		>
			{children}
		</View>
	);
}
