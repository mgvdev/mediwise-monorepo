import { cn } from "heroui-native";
import type { PropsWithChildren } from "react";
import type { ScrollViewProps } from "react-native";
import { View } from "react-native";
import { SoftHealthBackground } from "@/components/base/backgrounds";
import { Container } from "@/components/layout/container";

type TabScreenProps = {
	className?: string;
	scrollProps?: ScrollViewProps;
	scroll?: boolean;
};

/**
 * Standard layout for screens rendered directly under the bottom NativeTabs:
 * soft gradient background + a `tabScreen` Container (top inset under the
 * Dynamic Island, bottom clearance for the floating tab bar).
 */
export function TabScreen({
	children,
	className,
	scrollProps,
	scroll,
}: PropsWithChildren<TabScreenProps>) {
	return (
		<View className="flex-1 bg-background">
			<SoftHealthBackground heightRatio={1} />
			<Container
				tabScreen
				scroll={scroll}
				scrollProps={scrollProps}
				className={cn("bg-transparent", className)}
			>
				{children}
			</Container>
		</View>
	);
}
