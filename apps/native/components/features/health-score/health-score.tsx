import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { applyOpacity } from "@/components/utils/color-utils";

type HealthScoreProps = {
	score: number;
	max?: number;
	updatedLabel?: string;
	summary?: string;
	className?: string;
};

type ScoreTone = "good" | "average" | "bad";

const SCORE_COLORS: Record<ScoreTone, string> = {
	good: "#45B9A6",
	average: "#F3B44A",
	bad: "#E35A5A",
};

const DOT_COUNT = 48;
const SIZE = 240;
const CENTER = SIZE / 2;
const DOT_RING_RADIUS = 92;

function getTone(score: number, max: number) {
	const ratio = max > 0 ? score / max : 0;
	if (ratio >= 0.75) return "good";
	if (ratio >= 0.4) return "average";
	return "bad";
}

export function HealthScore({
	score,
	max = 100,
	updatedLabel,
	summary,
	className,
}: HealthScoreProps) {
	const safeScore = Math.max(0, Math.min(score, max));
	const tone = getTone(safeScore, max);
	const accent = SCORE_COLORS[tone];
	const ringColor = applyOpacity(accent, 0.4) ?? accent;
	const dotColor = applyOpacity(accent, 0.6) ?? accent;

	return (
		<View className={cn("items-center gap-6", className)}>
			<View
				className="relative items-center justify-center"
				style={{ width: SIZE, height: SIZE }}
			>
				<Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
					{Array.from({ length: DOT_COUNT }, (_, index) => {
						const indexKey = index + 1;
						const angle = (Math.PI * 2 * index) / DOT_COUNT;
						const radius = DOT_RING_RADIUS + (index % 4 === 0 ? 8 : 0);
						const dotSize = index % 4 === 0 ? 6 : index % 2 === 0 ? 4 : 3;
						const x = CENTER + radius * Math.cos(angle);
						const y = CENTER + radius * Math.sin(angle);
						return (
							<Circle
								key={`dot-${indexKey}`}
								cx={x}
								cy={y}
								r={dotSize}
								fill={dotColor}
								opacity={index % 4 === 0 ? 0.9 : 0.4}
							/>
						);
					})}
				</Svg>
				<View
					className="absolute items-center justify-center rounded-full bg-background"
					style={{
						width: 168,
						height: 168,
						borderWidth: 3,
						borderColor: ringColor,
					}}
				>
					<Text className="text-4xl text-foreground" style={{ color: accent }}>
						{safeScore}
					</Text>
					<Text className="text-muted text-sm">out of {max}</Text>
				</View>
			</View>

			{updatedLabel ? (
				<View className="flex-row items-center gap-2">
					<Ionicons name="sync" size={16} className="text-muted" />
					<Text className="text-muted text-sm">{updatedLabel}</Text>
				</View>
			) : null}

			{summary ? (
				<Text className="text-center text-base text-foreground">{summary}</Text>
			) : null}
		</View>
	);
}
