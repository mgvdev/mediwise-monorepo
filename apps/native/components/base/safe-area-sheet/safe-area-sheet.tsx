import { cn } from "heroui-native";
import type { ReactNode } from "react";
import {
	Modal,
	Pressable,
	useWindowDimensions,
	View,
	type ViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { pressableFeedback } from "@/components/utils";

type SafeAreaSheetProps = {
	visible: boolean;
	onClose: () => void;
	children: ReactNode;
	contentClassName?: string;
	containerClassName?: string;
	dismissOnBackdropPress?: boolean;
	/**
	 * The max height we ask to the sheet, if null it's go maximum of screen
	 */
	maxHeight?: number;
} & ViewProps;

export function SafeAreaSheet({
	visible,
	onClose,
	children,
	contentClassName,
	containerClassName,
	dismissOnBackdropPress = true,
	...viewProps
}: SafeAreaSheetProps) {
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const maxHeight = Math.max(
		0,
		height - insets.top - Math.max(insets.bottom, 12),
	);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View className={cn("", containerClassName)}>
				<Pressable
					className="flex-1 bg-black/30"
					onPress={dismissOnBackdropPress ? onClose : undefined}
					style={pressableFeedback(undefined, {
						opacity: 0.2,
						scale: 1,
					})}
				/>
				<View
					className={contentClassName}
					style={{
						maxHeight,
						paddingBottom: Math.max(insets.bottom, 16),
					}}
					{...viewProps}
				>
					{children}
				</View>
			</View>
		</Modal>
	);
}
