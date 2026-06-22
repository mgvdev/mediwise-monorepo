import * as React from "react";
import { FlatList, Text, View } from "react-native";
import { RollingNumber } from "@/components/base/rolling-number";

const ITEM_HEIGHT = 36;

export const SYSTOLIC_RANGE = Array.from({ length: 151 }, (_, i) => i + 70); // 70–220
export const DIASTOLIC_RANGE = Array.from({ length: 101 }, (_, i) => i + 40); // 40–140

type BpCategory = { label: string; color: string };

// Thresholds follow the AHA blood-pressure categories. Informational only.
export function classifyBloodPressure(
	systolic: number,
	diastolic: number,
): BpCategory {
	if (systolic > 180 || diastolic > 120)
		return { label: "Hypertensive crisis", color: "#b91c1c" };
	if (systolic >= 140 || diastolic >= 90)
		return { label: "Hypertension stage 2", color: "#dc2626" };
	if (systolic >= 130 || diastolic >= 80)
		return { label: "Hypertension stage 1", color: "#ea580c" };
	if (systolic >= 120) return { label: "Elevated", color: "#d97706" };
	return { label: "Normal", color: "#16a34a" };
}

type WheelColumnProps = {
	label: string;
	values: number[];
	value: number;
	onChange: (next: number) => void;
};

function WheelColumn({ label, values, value, onChange }: WheelColumnProps) {
	const listRef = React.useRef<FlatList<number>>(null);
	const frameRef = React.useRef<number | null>(null);
	const isUserScrollRef = React.useRef(false);
	const lastValueRef = React.useRef(value);
	const [containerHeight, setContainerHeight] = React.useState(0);
	const padding =
		containerHeight > 0
			? (containerHeight - ITEM_HEIGHT) / 2
			: ITEM_HEIGHT * 2;

	React.useEffect(() => {
		const index = Math.max(0, values.indexOf(value));
		if (index >= 0) {
			listRef.current?.scrollToIndex({ index, animated: false });
		}
		lastValueRef.current = value;
	}, [value, values]);

	const resolveValue = (offsetY: number) => {
		const index = Math.round(offsetY / ITEM_HEIGHT);
		return values[Math.max(0, Math.min(values.length - 1, index))];
	};

	const handleScroll = (offsetY: number) => {
		if (!isUserScrollRef.current) return;
		if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		frameRef.current = requestAnimationFrame(() => {
			const next = resolveValue(offsetY);
			if (next !== lastValueRef.current) {
				lastValueRef.current = next;
				onChange(next);
			}
		});
	};

	React.useEffect(() => {
		return () => {
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		};
	}, []);

	return (
		<View className="flex-1 gap-2">
			<Text className="text-center text-muted text-xs">{label}</Text>
			<View
				className="relative h-48"
				onLayout={(event) =>
					setContainerHeight(event.nativeEvent.layout.height)
				}
			>
				<View
					className="absolute right-0 left-0 rounded-2xl border border-primary bg-primary/10"
					style={{
						top:
							containerHeight > 0
								? containerHeight / 2 - ITEM_HEIGHT / 2
								: "50%",
						height: ITEM_HEIGHT,
						...(containerHeight > 0
							? null
							: { transform: [{ translateY: -ITEM_HEIGHT / 2 }] }),
					}}
				/>
				<View
					pointerEvents="none"
					className="absolute top-0 right-0 left-0 h-8 bg-background/90"
				/>
				<View
					pointerEvents="none"
					className="absolute right-0 bottom-0 left-0 h-8 bg-background/90"
				/>
				<FlatList
					ref={listRef}
					data={values}
					keyExtractor={(item) => `${item}`}
					nestedScrollEnabled
					showsVerticalScrollIndicator={false}
					snapToInterval={ITEM_HEIGHT}
					snapToAlignment="center"
					decelerationRate="normal"
					contentContainerStyle={{ paddingVertical: padding }}
					onScroll={(event) =>
						handleScroll(event.nativeEvent.contentOffset.y)
					}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {
						isUserScrollRef.current = true;
					}}
					onScrollEndDrag={() => {
						isUserScrollRef.current = true;
					}}
					getItemLayout={(_, index) => ({
						length: ITEM_HEIGHT,
						offset: ITEM_HEIGHT * index,
						index,
					})}
					onMomentumScrollEnd={(event) => {
						isUserScrollRef.current = false;
						onChange(resolveValue(event.nativeEvent.contentOffset.y));
					}}
					renderItem={({ item }) => (
						<View
							className="items-center justify-center"
							style={{ height: ITEM_HEIGHT }}
						>
							<Text className="text-base text-muted">{item}</Text>
						</View>
					)}
				/>
			</View>
		</View>
	);
}

type BloodPressurePickerProps = {
	systolic: number;
	diastolic: number;
	onChange: (systolic: number, diastolic: number) => void;
};

export function BloodPressurePicker({
	systolic,
	diastolic,
	onChange,
}: BloodPressurePickerProps) {
	const category = classifyBloodPressure(systolic, diastolic);

	return (
		<View className="gap-6">
			<View className="items-center">
				<View className="flex-row items-center">
					<RollingNumber value={systolic} />
					<Text className="px-1 font-semibold text-4xl text-muted">/</Text>
					<RollingNumber value={diastolic} />
					<Text className="self-end pb-2 text-base text-muted"> mmHg</Text>
				</View>
				<View className="mt-2 flex-row items-center gap-2">
					<View
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: category.color }}
					/>
					<Text className="text-foreground text-sm">{category.label}</Text>
				</View>
				<Text className="mt-1 text-muted text-xs">
					For information only — not a diagnosis.
				</Text>
			</View>

			<View className="flex-row gap-4">
				<WheelColumn
					label="Systolic"
					values={SYSTOLIC_RANGE}
					value={systolic}
					onChange={(next) => onChange(next, diastolic)}
				/>
				<WheelColumn
					label="Diastolic"
					values={DIASTOLIC_RANGE}
					value={diastolic}
					onChange={(next) => onChange(systolic, next)}
				/>
			</View>
		</View>
	);
}
