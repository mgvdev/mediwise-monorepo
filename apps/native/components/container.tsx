import { cn } from "heroui-native";
import type { PropsWithChildren } from "react";
import {
	ScrollView,
	type ScrollViewProps,
	View,
	type ViewProps,
} from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = AnimatedProps<ViewProps> & {
	className?: string;
	scrollProps?: ScrollViewProps;
};

export function Container({
	children,
	className,
	scrollProps,
	...props
}: PropsWithChildren<Props>) {
	const insets = useSafeAreaInsets();

	return (
		<AnimatedView
			className={cn("flex-1 bg-background", className)}
			style={{
				paddingBottom: insets.bottom,
			}}
			{...props}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} {...scrollProps}>
				{children}
			</ScrollView>
		</AnimatedView>
	);
}
