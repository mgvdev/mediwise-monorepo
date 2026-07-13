import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

type Blob = {
	color: string;
	/** Base position as a fraction of the screen (0..1). */
	x: number;
	y: number;
	/** Drift amount in px along each axis. */
	dx: number;
	dy: number;
	duration: number;
	sizeRatio: number;
	/** Peak opacity at the center of the glow (fades to 0 at the edge). */
	peak: number;
};

const BLOBS: Blob[] = [
	{
		color: "#2FB89C",
		x: 0.3,
		y: 0.16,
		dx: 34,
		dy: 22,
		duration: 17000,
		sizeRatio: 1.15,
		peak: 0.22,
	},
	{
		color: "#57BE8C",
		x: 0.82,
		y: 0.32,
		dx: -30,
		dy: 24,
		duration: 23000,
		sizeRatio: 1.05,
		peak: 0.16,
	},
	{
		color: "#E4885C",
		x: 0.74,
		y: 0.74,
		dx: -28,
		dy: -22,
		duration: 21000,
		sizeRatio: 1.1,
		peak: 0.13,
	},
	{
		color: "#6BA0DE",
		x: 0.2,
		y: 0.82,
		dx: 36,
		dy: -20,
		duration: 27000,
		sizeRatio: 1.1,
		peak: 0.15,
	},
];

function DriftBlob({
	blob,
	width,
	height,
}: {
	blob: Blob;
	width: number;
	height: number;
}) {
	const t = useSharedValue(0);
	const size = width * blob.sizeRatio;
	const gradId = `bg-${blob.color.replace("#", "")}`;

	useEffect(() => {
		t.value = withRepeat(
			withTiming(1, {
				duration: blob.duration,
				easing: Easing.inOut(Easing.sin),
			}),
			-1,
			true,
		);
	}, [t, blob.duration]);

	const style = useAnimatedStyle(() => ({
		transform: [
			{ translateX: (t.value - 0.5) * blob.dx },
			{ translateY: (t.value - 0.5) * blob.dy },
			{ scale: 0.96 + t.value * 0.08 },
		],
	}));

	return (
		<Animated.View
			style={[
				{
					position: "absolute",
					width: size,
					height: size,
					left: blob.x * width - size / 2,
					top: blob.y * height - size / 2,
				},
				style,
			]}
		>
			<Svg width={size} height={size}>
				<Defs>
					<RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
						<Stop offset="0%" stopColor={blob.color} stopOpacity={blob.peak} />
						<Stop
							offset="55%"
							stopColor={blob.color}
							stopOpacity={blob.peak * 0.35}
						/>
						<Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
					</RadialGradient>
				</Defs>
				<Rect width={size} height={size} fill={`url(#${gradId})`} />
			</Svg>
		</Animated.View>
	);
}

/**
 * Very light moving background: a few large, soft radial glows in the flower
 * palette that slowly drift. Each glow is a static SVG radial gradient (soft
 * edges) inside a reanimated-driven View (movement) — no animated SVG props.
 */
export function FlowerBackground() {
	const { width, height } = useWindowDimensions();
	return (
		<View style={StyleSheet.absoluteFill} pointerEvents="none">
			{BLOBS.map((blob) => (
				<DriftBlob key={blob.color} blob={blob} width={width} height={height} />
			))}
		</View>
	);
}
