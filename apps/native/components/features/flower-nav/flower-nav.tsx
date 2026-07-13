import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { type Href, router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, LinearGradient, Stop } from "react-native-svg";

import { CENTER, type Petal, PETALS } from "./petal-config";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEG = Math.PI / 180;

function haptic() {
	if (Platform.OS === "ios") {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}
}

type Dims = {
	size: number;
	center: number;
	radius: number;
	petalW: number;
	petalH: number;
};

function useDims(size: number): Dims {
	return {
		size,
		center: size / 2,
		radius: size * 0.3,
		petalW: size * 0.29,
		petalH: size * 0.4,
	};
}

function PetalNode({
	petal,
	index,
	dims,
}: {
	petal: Petal;
	index: number;
	dims: Dims;
}) {
	const { center, radius, petalW, petalH } = dims;
	const dx = Math.sin(petal.angle * DEG);
	const dy = -Math.cos(petal.angle * DEG);
	const cx = center + radius * dx;
	const cy = center + radius * dy;
	const left = cx - petalW / 2;
	const top = cy - petalH / 2;

	const bloom = useSharedValue(0);
	const float = useSharedValue(0);

	useEffect(() => {
		bloom.value = withDelay(
			120 + index * 90,
			withSpring(1, { damping: 12, stiffness: 120, mass: 0.7 }),
		);
		float.value = withDelay(
			900 + index * 90,
			withRepeat(
				withTiming(1, {
					duration: 2600 + index * 160,
					easing: Easing.inOut(Easing.sin),
				}),
				-1,
				true,
			),
		);
	}, [bloom, float, index]);

	const containerStyle = useAnimatedStyle(() => {
		const collapse = 1 - bloom.value;
		const floatAmt = (float.value - 0.5) * 6;
		return {
			opacity: bloom.value,
			transform: [
				{ translateX: -radius * dx * collapse + dx * floatAmt },
				{ translateY: -radius * dy * collapse + dy * floatAmt },
				{ scale: 0.5 + 0.5 * bloom.value },
			],
		};
	});

	const gradId = `petal-${petal.key}`;

	return (
		<AnimatedPressable
			onPressIn={haptic}
			onPress={() => router.push(petal.route as Href)}
			accessibilityRole="button"
			accessibilityLabel={petal.label}
			style={[
				styles.petal,
				{ left, top, width: petalW, height: petalH },
				containerStyle,
			]}
		>
			{/* Rotated petal shape */}
			<View
				style={[
					StyleSheet.absoluteFill,
					{ transform: [{ rotate: `${petal.angle}deg` }] },
				]}
			>
				<Svg width="100%" height="100%">
					<Defs>
						<LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0%" stopColor={petal.tint} stopOpacity="1" />
							<Stop offset="100%" stopColor={petal.color} stopOpacity="1" />
						</LinearGradient>
					</Defs>
					<Ellipse
						cx="50%"
						cy="50%"
						rx="46%"
						ry="48%"
						fill={`url(#${gradId})`}
					/>
				</Svg>
			</View>
			{/* Upright content, centered on the petal */}
			<View
				style={[StyleSheet.absoluteFill, styles.petalContent]}
				pointerEvents="none"
			>
				<Ionicons name={petal.icon} size={dims.size * 0.075} color="#fff" />
				<Text style={styles.petalLabel} numberOfLines={1}>
					{petal.label}
				</Text>
			</View>
		</AnimatedPressable>
	);
}

function CenterHeart({ dims }: { dims: Dims }) {
	const { center, size } = dims;
	const d = size * 0.17;
	const bloom = useSharedValue(0);
	const pulse = useSharedValue(0);

	useEffect(() => {
		bloom.value = withSpring(1, { damping: 11, stiffness: 130, mass: 0.6 });
		pulse.value = withDelay(
			600,
			withRepeat(
				withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
				-1,
				true,
			),
		);
	}, [bloom, pulse]);

	const style = useAnimatedStyle(() => ({
		opacity: bloom.value,
		transform: [
			{ scale: (0.4 + 0.6 * bloom.value) * (1 + pulse.value * 0.05) },
		],
	}));

	return (
		<AnimatedPressable
			onPressIn={haptic}
			onPress={() => router.push(CENTER.route as Href)}
			accessibilityRole="button"
			accessibilityLabel="Talk to Mediwise"
			style={[
				styles.center,
				{
					width: d,
					height: d,
					borderRadius: d / 2,
					left: center - d / 2,
					top: center - d / 2,
				},
				style,
			]}
		>
			<Svg width="100%" height="100%">
				<Defs>
					<LinearGradient id="heart" x1="0" y1="0" x2="1" y2="1">
						<Stop offset="0%" stopColor={CENTER.tint} stopOpacity="1" />
						<Stop offset="100%" stopColor={CENTER.color} stopOpacity="1" />
					</LinearGradient>
				</Defs>
				<Ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="url(#heart)" />
			</Svg>
			<View
				style={StyleSheet.absoluteFill}
				className="items-center justify-center"
			>
				<Ionicons name="sparkles" size={d * 0.4} color="#fff" />
			</View>
		</AnimatedPressable>
	);
}

export function FlowerNav({ size }: { size: number }) {
	const dims = useDims(size);
	return (
		<View style={{ width: dims.size, height: dims.size }}>
			{PETALS.map((petal, index) => (
				<PetalNode key={petal.key} petal={petal} index={index} dims={dims} />
			))}
			<CenterHeart dims={dims} />
		</View>
	);
}

const styles = StyleSheet.create({
	petal: {
		position: "absolute",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.16,
		shadowRadius: 14,
		elevation: 6,
	},
	petalContent: {
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	petalLabel: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "600",
		textAlign: "center",
	},
	center: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#2FB89C",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 16,
		elevation: 8,
	},
});
