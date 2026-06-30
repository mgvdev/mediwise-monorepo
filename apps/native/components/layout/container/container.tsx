import { cn } from "heroui-native";
import type { PropsWithChildren } from "react";
import {
	ScrollView,
	type ScrollViewProps,
	type StyleProp,
	View,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Approximate height of the floating native tab bar; scroll content needs this
// much bottom clearance so the last items aren't hidden behind it.
const FLOATING_TAB_BAR_HEIGHT = 88;

type Props = ViewProps & {
	className?: string;
	scrollProps?: ScrollViewProps;
	scroll?: boolean;
	// Set on screens rendered directly under the bottom NativeTabs (no native
	// header). Content scrolls continuously under a frosted top bar (mirroring
	// the native tab bar's glass); at rest it starts below the status
	// bar / Dynamic Island, and clears the floating tab bar at the bottom.
	tabScreen?: boolean;
};

export function Container({
	children,
	className,
	scrollProps,
	scroll = true,
	tabScreen = false,
	...props
}: PropsWithChildren<Props>) {
	const insets = useSafeAreaInsets();
	const { contentContainerStyle, ...restScrollProps } = scrollProps ?? {};

	return (
		<View
			className={cn("bg-background flex-1", className)}
			style={{
				paddingBottom: tabScreen ? 0 : insets.bottom,
			}}
			{...props}
		>
			{scroll ? (
				<ScrollView
					contentContainerStyle={
						[
							{ flexGrow: 1 },
							tabScreen
								? {
										paddingTop: insets.top,
										paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT,
									}
								: null,
							contentContainerStyle,
						] as StyleProp<ViewStyle>
					}
					showsVerticalScrollIndicator={false}
					{...restScrollProps}
				>
					{children}
				</ScrollView>
			) : (
				<View className="flex-1">{children}</View>
			)}
		</View>
	);
}
