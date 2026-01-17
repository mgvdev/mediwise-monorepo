import { Button } from "heroui-native";
import * as React from "react";
import { FlatList, Text, useWindowDimensions, View } from "react-native";

const KG_RANGE = Array.from({ length: 171 }, (_, i) => i + 30);
const LBS_RANGE = Array.from({ length: 375 }, (_, i) => i + 70);

type WeightUnit = "kg" | "lbs";

type WeightPickerProps = {
	value: number;
	unit: WeightUnit;
	onChange: (nextValue: number, nextUnit: WeightUnit) => void;
};

export function WeightPicker({ value, unit, onChange }: WeightPickerProps) {
	const { width } = useWindowDimensions();
	const listRef = React.useRef<FlatList<number>>(null);
	const frameRef = React.useRef<number | null>(null);
	const isDraggingRef = React.useRef(false);
	const lastValueRef = React.useRef(value);
	const [containerWidth, setContainerWidth] = React.useState(width);
	const values = unit === "kg" ? KG_RANGE : LBS_RANGE;
	const itemWidth = 14;
	const sidePadding = Math.max(0, containerWidth / 2 - itemWidth / 2);
	const [displayValue, setDisplayValue] = React.useState(value);

	React.useEffect(() => {
		const index = Math.max(0, values.indexOf(value));
		if (index >= 0 && !isDraggingRef.current) {
			listRef.current?.scrollToIndex({ index, animated: false });
		}
		setDisplayValue(value);
	}, [value, values]);

	const handleScrollEnd = (offsetX: number) => {
		const index = Math.round(offsetX / itemWidth);
		const nextValue = values[Math.max(0, Math.min(values.length - 1, index))];
		setDisplayValue(nextValue);
		if (nextValue !== value) {
			onChange(nextValue, unit);
		}
	};

	const handleScroll = (offsetX: number) => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
		}
		frameRef.current = requestAnimationFrame(() => {
			const index = Math.round(offsetX / itemWidth);
			const nextValue = values[Math.max(0, Math.min(values.length - 1, index))];
			if (nextValue !== lastValueRef.current) {
				lastValueRef.current = nextValue;
				setDisplayValue(nextValue);
				onChange(nextValue, unit);
			}
		});
	};

	React.useEffect(() => {
		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return (
		<View className="gap-6">
			<View className="flex-row items-center justify-center rounded-full border border-border/60 p-1">
				<Button
					size="sm"
					variant={unit === "kg" ? "solid" : "ghost"}
					onPress={() => onChange(value, "kg")}
				>
					<Button.Label>kg</Button.Label>
				</Button>
				<Button
					size="sm"
					variant={unit === "lbs" ? "solid" : "ghost"}
					onPress={() => onChange(value, "lbs")}
				>
					<Button.Label>lbs</Button.Label>
				</Button>
			</View>

			<View className="items-center">
				<Text className="font-semibold text-5xl text-foreground">
					{displayValue}
					<Text className="text-base text-muted"> {unit}</Text>
				</Text>
				<Text className="mt-1 text-muted text-xs">Scroll to adjust</Text>
			</View>

			<View
				className="relative"
				onLayout={(event) => {
					setContainerWidth(event.nativeEvent.layout.width || width);
				}}
			>
				<View
					className="absolute top-0 h-8 items-center"
					style={{
						left: "50%",
						width: itemWidth,
						transform: [{ translateX: -itemWidth / 2 }],
					}}
				>
					<View
						className="bg-primary"
						style={{
							width: 3,
							height: 32,
							borderRadius: 999,
						}}
					/>
				</View>
				<FlatList
					ref={listRef}
					horizontal
					data={values}
					keyExtractor={(item) => `${item}`}
					showsHorizontalScrollIndicator={false}
					snapToInterval={itemWidth}
					decelerationRate="fast"
					contentContainerStyle={{ paddingHorizontal: sidePadding }}
					onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.x)}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {
						isDraggingRef.current = true;
					}}
					onScrollEndDrag={() => {
						isDraggingRef.current = false;
					}}
					getItemLayout={(_, index) => ({
						length: itemWidth,
						offset: itemWidth * index,
						index,
					})}
					onMomentumScrollEnd={(event) =>
						handleScrollEnd(event.nativeEvent.contentOffset.x)
					}
					renderItem={({ item }) => {
						const isMajor = item % 10 === 0;
						return (
							<View className="items-center" style={{ width: itemWidth }}>
								<View
									className="bg-muted"
									style={{
										width: 3,
										height: isMajor ? 18 : 10,
										borderRadius: 999,
									}}
								/>
								{isMajor ? (
									<Text
										className="mt-2 text-[10px] text-muted"
										style={{
											width: itemWidth * 3,
											textAlign: "center",
										}}
										numberOfLines={1}
									>
										{item}
									</Text>
								) : null}
							</View>
						);
					}}
				/>
			</View>
		</View>
	);
}
