import { Button } from "heroui-native";
import * as React from "react";
import { FlatList, Text, View } from "react-native";
import { RollingNumber } from "@/components/base/rolling-number";

const CM_RANGE = Array.from({ length: 131 }, (_, i) => i + 120);
const IN_RANGE = Array.from({ length: 57 }, (_, i) => i + 48);

type HeightUnit = "cm" | "inch";

type HeightPickerProps = {
	value: number;
	unit: HeightUnit;
	onChange: (nextValue: number, nextUnit: HeightUnit) => void;
};

export function HeightPicker({ value, unit, onChange }: HeightPickerProps) {
	const listRef = React.useRef<FlatList<number>>(null);
	const frameRef = React.useRef<number | null>(null);
	const isUserScrollRef = React.useRef(false);
	const lastValueRef = React.useRef(value);
	const [containerHeight, setContainerHeight] = React.useState(0);
	const values = unit === "cm" ? CM_RANGE : IN_RANGE;
	const itemHeight = 36;
	const padding =
		containerHeight > 0 ? (containerHeight - itemHeight) / 2 : itemHeight * 2;
	const [displayValue, setDisplayValue] = React.useState(value);

	React.useEffect(() => {
		const index = Math.max(0, values.indexOf(value));
		if (index >= 0) {
			listRef.current?.scrollToIndex({ index, animated: false });
		}
		lastValueRef.current = value;
		setDisplayValue(value);
	}, [value, values]);

	const handleScrollEnd = (offsetY: number) => {
		const index = Math.round(offsetY / itemHeight);
		const nextValue = values[Math.max(0, Math.min(values.length - 1, index))];
		setDisplayValue(nextValue);
		if (nextValue !== value) {
			onChange(nextValue, unit);
		}
	};

	const handleScroll = (offsetY: number) => {
		if (!isUserScrollRef.current) return;
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
		}
		frameRef.current = requestAnimationFrame(() => {
			const index = Math.round(offsetY / itemHeight);
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
					variant={unit === "cm" ? "solid" : "ghost"}
					onPress={() => onChange(value, "cm")}
				>
					<Button.Label>cm</Button.Label>
				</Button>
				<Button
					size="sm"
					variant={unit === "inch" ? "solid" : "ghost"}
					onPress={() => onChange(value, "inch")}
				>
					<Button.Label>inch</Button.Label>
				</Button>
			</View>

			<View className="items-center">
				<View className="flex-row items-end">
					<RollingNumber value={displayValue} />
					<Text className="self-end pb-2 text-base text-muted"> {unit}</Text>
				</View>
				<Text className="mt-1 text-muted text-xs">Scroll to adjust</Text>
			</View>

			<View
				className="relative h-56"
				onLayout={(event) =>
					setContainerHeight(event.nativeEvent.layout.height)
				}
			>
				<View
					className="absolute right-0 left-0 rounded-2xl border border-primary bg-primary/10"
					style={{
						top:
							containerHeight > 0
								? containerHeight / 2 - itemHeight / 2
								: "50%",
						height: itemHeight,
						...(containerHeight > 0
							? null
							: { transform: [{ translateY: -itemHeight / 2 }] }),
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
					snapToInterval={itemHeight}
					snapToAlignment="center"
					decelerationRate="normal"
					contentContainerStyle={{ paddingVertical: padding }}
					onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {
						isUserScrollRef.current = true;
					}}
					onScrollEndDrag={() => {
						isUserScrollRef.current = true;
					}}
					getItemLayout={(_, index) => ({
						length: itemHeight,
						offset: itemHeight * index,
						index,
					})}
					onMomentumScrollEnd={(event) => {
						isUserScrollRef.current = false;
						handleScrollEnd(event.nativeEvent.contentOffset.y);
					}}
					renderItem={({ item }) => (
						<View
							className="items-center justify-center"
							style={{ height: itemHeight }}
						>
							<Text className="text-base text-muted">{item}</Text>
						</View>
					)}
				/>
			</View>
		</View>
	);
}
