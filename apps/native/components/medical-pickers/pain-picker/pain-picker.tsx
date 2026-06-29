import { cn } from "heroui-native";
import * as React from "react";
import { FlatList, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type PainLevel = 0 | 1 | 2 | 3 | 4 | 5;

type PainPickerProps = {
	value: PainLevel;
	onChange: (next: PainLevel) => void;
	className?: string;
};

type PainOption = {
	value: PainLevel;
	label: string;
	colorClass: string;
	mood: "happy" | "smile" | "neutral" | "sad" | "ouch" | "worst";
};

const PAIN_LEVELS: PainOption[] = [
	{
		value: 0,
		label: "No pain",
		colorClass: "bg-[#F5C84B]",
		mood: "happy",
	},
	{
		value: 1,
		label: "Mild discomfort",
		colorClass: "bg-[#FFE08A]",
		mood: "smile",
	},
	{
		value: 2,
		label: "Noticeable pain",
		colorClass: "bg-[#FFC766]",
		mood: "neutral",
	},
	{
		value: 3,
		label: "Uncomfortable",
		colorClass: "bg-[#FFAC5C]",
		mood: "sad",
	},
	{
		value: 4,
		label: "Severe pain",
		colorClass: "bg-[#FF8A4C]",
		mood: "ouch",
	},
	{
		value: 5,
		label: "Worst possible",
		colorClass: "bg-[#F97373]",
		mood: "worst",
	},
];

function FaceIcon({ mood }: { mood: PainOption["mood"] }) {
	const strokeWidth = 6;

	const mouthPath = (() => {
		switch (mood) {
			case "happy":
				return "M28 46 C36 56 52 56 60 46";
			case "smile":
				return "M28 48 C36 54 52 54 60 48";
			case "neutral":
				return "M28 52 L60 52";
			case "sad":
				return "M28 58 C36 50 52 50 60 58";
			case "ouch":
				return "M28 58 C36 50 52 50 60 58";
			case "worst":
				return "M30 60 C38 48 50 48 58 60";
			default:
				return "M28 52 L60 52";
		}
	})();

	return (
		<Svg width={88} height={88} viewBox="0 0 88 88" className="text-white">
			{mood === "worst" ? (
				<>
					<Path
						d="M28 30 L36 38 M36 30 L28 38"
						stroke="currentColor"
						strokeWidth={strokeWidth}
						strokeLinecap="round"
					/>
					<Path
						d="M60 30 L68 38 M68 30 L60 38"
						stroke="currentColor"
						strokeWidth={strokeWidth}
						strokeLinecap="round"
					/>
				</>
			) : (
				<>
					<Circle cx={32} cy={34} r={6} fill="currentColor" />
					<Circle cx={56} cy={34} r={6} fill="currentColor" />
				</>
			)}
			<Path
				d={mouthPath}
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			{mood === "ouch" ? (
				<Circle cx={44} cy={60} r={5} fill="currentColor" />
			) : null}
		</Svg>
	);
}

function ArrowIndicator() {
	return (
		<Svg width={20} height={12} viewBox="0 0 24 12" className="text-muted">
			<Path d="M2 2 L12 10 L22 2" fill="currentColor" />
		</Svg>
	);
}

export function PainPicker({ value, onChange, className }: PainPickerProps) {
	const listRef = React.useRef<FlatList<PainOption>>(null);
	const { width } = useWindowDimensions();
	const itemSize = 128;
	const baseSize = 92;
	const selectedSize = 92;
	const [containerWidth, setContainerWidth] = React.useState(width);
	const sidePadding = Math.max(0, containerWidth / 2 - itemSize / 2);

	React.useEffect(() => {
		const index = PAIN_LEVELS.findIndex((item) => item.value === value);
		if (index >= 0) {
			listRef.current?.scrollToIndex({ index, animated: true });
		}
	}, [value]);

	const handleMomentumEnd = (offsetX: number) => {
		const index = Math.round(offsetX / itemSize);
		const next =
			PAIN_LEVELS[Math.min(PAIN_LEVELS.length - 1, Math.max(0, index))];
		if (next && next.value !== value) {
			onChange(next.value);
		}
	};

	const current = PAIN_LEVELS.find((item) => item.value === value);

	return (
		<View className={cn("gap-6", className)}>
			<View className="relative items-center">
				<View
					className="absolute top-0"
					style={{ left: containerWidth / 2 - 10 }}
				>
					<ArrowIndicator />
				</View>
				<View
					className="w-full"
					onLayout={(event) =>
						setContainerWidth(event.nativeEvent.layout.width)
					}
				>
					<FlatList
						ref={listRef}
						horizontal
						data={PAIN_LEVELS}
						keyExtractor={(item) => `${item.value}`}
						showsHorizontalScrollIndicator={false}
						snapToInterval={itemSize}
						snapToAlignment="center"
						decelerationRate="fast"
						contentContainerStyle={{
							paddingHorizontal: sidePadding,
							paddingTop: 22,
						}}
						onMomentumScrollEnd={(event) =>
							handleMomentumEnd(event.nativeEvent.contentOffset.x)
						}
						getItemLayout={(_, index) => ({
							length: itemSize,
							offset: itemSize * index,
							index,
						})}
						renderItem={({ item }) => {
							const selected = item.value === value;
							const size = selected ? selectedSize : baseSize;
							return (
								<View className="items-center" style={{ width: itemSize }}>
									<View
										className={cn(
											"items-center justify-center rounded-full",
											item.colorClass,
											selected ? "opacity-100" : "opacity-45",
										)}
										style={{ width: size, height: size }}
									>
										<FaceIcon mood={item.mood} />
									</View>
								</View>
							);
						}}
						onScrollToIndexFailed={() => undefined}
						initialScrollIndex={PAIN_LEVELS.findIndex(
							(item) => item.value === value,
						)}
					/>
				</View>
			</View>
			<Text className="text-muted text-center text-base">
				{current?.label ?? ""}
			</Text>
		</View>
	);
}

export type { PainLevel };
