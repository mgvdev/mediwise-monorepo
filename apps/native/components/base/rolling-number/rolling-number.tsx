import * as React from "react";
import { Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

type RollingDigitProps = {
	digit: number;
	height: number;
	fontSize: number;
	className?: string;
	duration: number;
};

// A single odometer column: a 0–9 strip translated vertically to the target digit.
function RollingDigit({
	digit,
	height,
	fontSize,
	className,
	duration,
}: RollingDigitProps) {
	const translateY = useSharedValue(-digit * height);

	React.useEffect(() => {
		translateY.value = withTiming(-digit * height, { duration });
	}, [digit, height, duration, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<View style={{ height, overflow: "hidden" }}>
			<Animated.View style={animatedStyle}>
				{DIGITS.map((value) => (
					<View
						key={value}
						style={{ height }}
						className="items-center justify-center"
					>
						<Text className={className} style={{ fontSize }}>
							{value}
						</Text>
					</View>
				))}
			</Animated.View>
		</View>
	);
}

type RollingNumberProps = {
	value: number;
	height?: number;
	fontSize?: number;
	className?: string;
	duration?: number;
};

/**
 * Animated number readout where each digit rolls vertically to its new value,
 * matching the feel of a wheel picker. Non-digit characters render statically.
 */
export function RollingNumber({
	value,
	height = 52,
	fontSize = 44,
	className = "font-semibold text-foreground",
	duration = 160,
}: RollingNumberProps) {
	const chars = String(value).split("");

	return (
		<View className="flex-row">
			{chars.map((char, index) => {
				const key = `${index}-${chars.length}`;
				if (!/\d/.test(char)) {
					return (
						<View
							key={key}
							style={{ height }}
							className="items-center justify-center"
						>
							<Text className={className} style={{ fontSize }}>
								{char}
							</Text>
						</View>
					);
				}
				return (
					<RollingDigit
						key={key}
						digit={Number(char)}
						height={height}
						fontSize={fontSize}
						className={className}
						duration={duration}
					/>
				);
			})}
		</View>
	);
}
