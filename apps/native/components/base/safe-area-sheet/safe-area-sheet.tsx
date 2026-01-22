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
	presentationStyle?:
		| "pageSheet"
		| "formSheet"
		| "fullScreen"
		| "overFullScreen";
	/**
	 * Custom styles for the sheet container.
	 */
	contentStyle?: ViewProps["style"];
} & ViewProps;

export function SafeAreaSheet({
	visible,
	onClose,
	children,
	contentClassName,
	containerClassName,
	dismissOnBackdropPress = true,
	maxHeight: maxHeightOverride,
	presentationStyle = "pageSheet",
	contentStyle,
	style,
	...viewProps
}: SafeAreaSheetProps) {
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const maxHeight = Math.max(
		0,
		height - insets.top - Math.max(insets.bottom, 12),
	);
	const resolvedMaxHeight = maxHeightOverride ?? maxHeight;
	const isOverlay = presentationStyle === "overFullScreen";
	const bottomInset = Math.max(insets.bottom, 12);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle={presentationStyle}
			transparent={isOverlay}
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View className={cn("flex-1 justify-end", containerClassName)}>
				{isOverlay ? (
					<Pressable
						className="absolute inset-0 bg-black/20"
						onPress={dismissOnBackdropPress ? onClose : undefined}
						style={pressableFeedback(undefined, {
							opacity: 0.2,
							scale: 1,
						})}
					/>
				) : null}
				<View
					className={contentClassName}
					style={[
						{
							maxHeight: resolvedMaxHeight,
							marginBottom: bottomInset,
						},
						contentStyle,
						style,
					]}
					{...viewProps}
				>
					{children}
				</View>
			</View>
		</Modal>
	);
}
