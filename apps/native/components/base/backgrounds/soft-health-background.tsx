import { cn } from "heroui-native";
import { useWindowDimensions, View } from "react-native";
import Svg, {
	Defs,
	LinearGradient,
	RadialGradient,
	Rect,
	Stop,
} from "react-native-svg";

type SoftHealthBackgroundProps = {
	className?: string;
	height?: number;
	heightRatio?: number;
};

export function SoftHealthBackground({
	className,
	height = 220,
	heightRatio,
}: SoftHealthBackgroundProps) {
	const { height: windowHeight } = useWindowDimensions();
	const resolvedHeight = heightRatio
		? Math.round(windowHeight * heightRatio)
		: height;

	return (
		<View
			className={cn("absolute top-0 right-0 left-0", className)}
			style={{ height: resolvedHeight }}
			pointerEvents="none"
		>
			<Svg width="100%" height="100%">
				<Defs>
					<RadialGradient id="blueGlow" cx="20%" cy="8%" r="55%">
						<Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
						<Stop offset="70%" stopColor="#3B82F6" stopOpacity="0" />
					</RadialGradient>
					<RadialGradient id="greenGlow" cx="72%" cy="12%" r="55%">
						<Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
						<Stop offset="70%" stopColor="#10B981" stopOpacity="0" />
					</RadialGradient>
					<LinearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
						<Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
					</LinearGradient>
				</Defs>
				<Rect width="100%" height="100%" fill="url(#blueGlow)" />
				<Rect width="100%" height="100%" fill="url(#greenGlow)" />
				<Rect width="100%" height="100%" fill="url(#fadeDown)" />
			</Svg>
		</View>
	);
}
