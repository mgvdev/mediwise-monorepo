import { cn } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import type {
	LayoutChangeEvent,
	PressableProps,
	TextProps,
	ViewProps,
} from "react-native";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { pressableFeedback } from "@/components/utils";

type CardProps = ViewProps & {
	variant?: "default" | "ai";
	aiAnimated?: boolean;
	className?: string;
};

const CARD_RADIUS = 16;
const AI_BORDER_WIDTH = 2;
const AI_BORDER_GLOW = 6;

type AiBorderProps = {
	width: number;
	height: number;
	animated: boolean;
};

function AiBorder({ width, height, animated }: AiBorderProps) {
	const strokeOffset = AI_BORDER_WIDTH / 2;
	const glowOffset = AI_BORDER_GLOW;
	const svgWidth = width + glowOffset * 2;
	const svgHeight = height + glowOffset * 2;
	const rectWidth = Math.max(0, width - AI_BORDER_WIDTH);
	const rectHeight = Math.max(0, height - AI_BORDER_WIDTH);
	const rotation = useRef(new Animated.Value(0)).current;
	const AnimatedLinearGradient = useRef(
		Animated.createAnimatedComponent(LinearGradient),
	).current;

	useEffect(() => {
		if (!animated) {
			rotation.setValue(0);
			return;
		}
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(rotation, {
					toValue: 1,
					duration: 7000,
					easing: Easing.linear,
					useNativeDriver: false,
				}),
				Animated.timing(rotation, {
					toValue: 0,
					duration: 7000,
					easing: Easing.linear,
					useNativeDriver: false,
				}),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [animated, rotation]);

	const x1 = rotation.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0, 1, 0],
	});
	const y1 = rotation.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0, 0, 1],
	});
	const x2 = rotation.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [1, 0, 1],
	});
	const y2 = rotation.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 0],
	});

	return (
		<View
			className="absolute"
			pointerEvents="none"
			style={{
				top: -glowOffset,
				left: -glowOffset,
				width: svgWidth,
				height: svgHeight,
			}}
		>
			<Svg width={svgWidth} height={svgHeight}>
				<Defs>
					<AnimatedLinearGradient id="aiGlow" x1={x1} y1={y1} x2={x2} y2={y2}>
						<Stop offset="0%" stopColor="#facc15" stopOpacity={0.35} />
						<Stop offset="25%" stopColor="#fb923c" stopOpacity={0.35} />
						<Stop offset="50%" stopColor="#38bdf8" stopOpacity={0.35} />
						<Stop offset="75%" stopColor="#ef4444" stopOpacity={0.35} />
						<Stop offset="100%" stopColor="#a855f7" stopOpacity={0.35} />
					</AnimatedLinearGradient>
					<AnimatedLinearGradient id="aiStroke" x1={x1} y1={y1} x2={x2} y2={y2}>
						<Stop offset="0%" stopColor="#facc15" />
						<Stop offset="25%" stopColor="#fb923c" />
						<Stop offset="50%" stopColor="#38bdf8" />
						<Stop offset="75%" stopColor="#ef4444" />
						<Stop offset="100%" stopColor="#a855f7" />
					</AnimatedLinearGradient>
				</Defs>
				<Rect
					x={glowOffset + strokeOffset}
					y={glowOffset + strokeOffset}
					width={rectWidth}
					height={rectHeight}
					rx={CARD_RADIUS}
					ry={CARD_RADIUS}
					stroke="url(#aiGlow)"
					strokeWidth={AI_BORDER_WIDTH * 4}
					fill="transparent"
				/>
				<Rect
					x={glowOffset + strokeOffset}
					y={glowOffset + strokeOffset}
					width={rectWidth}
					height={rectHeight}
					rx={CARD_RADIUS}
					ry={CARD_RADIUS}
					stroke="url(#aiStroke)"
					strokeWidth={AI_BORDER_WIDTH}
					fill="transparent"
				/>
			</Svg>
		</View>
	);
}

export function Card({
	className,
	variant = "default",
	aiAnimated = true,
	onLayout,
	...props
}: CardProps) {
	const baseClasses =
		"rounded-2xl border border-panel-border bg-panel-background p-4";

	if (variant === "ai") {
		return (
			<AiCard
				className={className}
				aiAnimated={aiAnimated}
				onLayout={onLayout}
				{...props}
			/>
		);
	}

	return <View className={cn(baseClasses, className)} {...props} />;
}

type AiCardProps = ViewProps & {
	aiAnimated: boolean;
	className?: string;
};

function AiCard({ className, aiAnimated, onLayout, ...props }: AiCardProps) {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const handleLayout = (event: LayoutChangeEvent) => {
		onLayout?.(event);
		const { width, height } = event.nativeEvent.layout;
		if (width !== size.width || height !== size.height) {
			setSize({ width, height });
		}
	};

	return (
		<View className="relative">
			{size.width > 0 ? (
				<AiBorder
					width={size.width}
					height={size.height}
					animated={aiAnimated}
				/>
			) : null}
			<View
				className={cn(
					"rounded-2xl border border-transparent bg-panel-background p-4",
					className,
				)}
				onLayout={handleLayout}
				{...props}
			/>
		</View>
	);
}

type CardHeaderProps = ViewProps & {
	className?: string;
};

export function CardHeader({ className, ...props }: CardHeaderProps) {
	return (
		<View
			className={cn("flex-row items-center justify-between", className)}
			{...props}
		/>
	);
}

type CardTitleProps = TextProps & {
	className?: string;
};

export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<Text
			className={cn("font-semibold text-base text-foreground", className)}
			{...props}
		/>
	);
}

type CardActionProps = PressableProps & {
	className?: string;
};

export function CardAction({ className, ...props }: CardActionProps) {
	const { style, ...pressableProps } = props;

	return (
		<Pressable
			className={cn(
				"items-center justify-center rounded-full border border-panel-border bg-white/70 px-3 py-1",
				className,
			)}
			style={pressableFeedback(style)}
			{...pressableProps}
		/>
	);
}

type CardBodyProps = ViewProps & {
	className?: string;
};

export function CardBody({ className, ...props }: CardBodyProps) {
	return <View className={cn("mt-3 gap-2", className)} {...props} />;
}

type CardFooterProps = ViewProps & {
	className?: string;
};

export function CardFooter({ className, ...props }: CardFooterProps) {
	return <View className={cn("mt-4", className)} {...props} />;
}
