import * as React from "react";
import { FlatList, Text, View } from "react-native";

const ITEM_HEIGHT = 36;
const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function buildYears() {
	const currentYear = new Date().getFullYear();
	const years: number[] = [];
	for (let year = currentYear; year >= 1920; year -= 1) {
		years.push(year);
	}
	return years;
}

const years = buildYears();

function daysInMonth(monthIndex: number, year: number) {
	return new Date(year, monthIndex + 1, 0).getDate();
}

type BirthdatePickerProps = {
	value?: string | null;
	onChange: (nextValue: string) => void;
};

export function BirthdatePicker({ value, onChange }: BirthdatePickerProps) {
	const initialDate = value ? new Date(value) : new Date(1990, 0, 1);
	const [selectedMonth, setSelectedMonth] = React.useState(
		Number.isNaN(initialDate.getTime()) ? 0 : initialDate.getMonth(),
	);
	const [selectedYear, setSelectedYear] = React.useState(
		Number.isNaN(initialDate.getTime()) ? 1990 : initialDate.getFullYear(),
	);
	const [selectedDay, setSelectedDay] = React.useState(
		Number.isNaN(initialDate.getTime()) ? 1 : initialDate.getDate(),
	);

	const days = React.useMemo(() => {
		const count = daysInMonth(selectedMonth, selectedYear);
		return Array.from({ length: count }, (_, index) => index + 1);
	}, [selectedMonth, selectedYear]);

	React.useEffect(() => {
		const maxDay = days[days.length - 1] ?? 1;
		if (selectedDay > maxDay) {
			setSelectedDay(maxDay);
		}
	}, [days, selectedDay]);

	React.useEffect(() => {
		const iso = new Date(selectedYear, selectedMonth, selectedDay)
			.toISOString()
			.slice(0, 10);
		onChange(iso);
	}, [selectedDay, selectedMonth, selectedYear, onChange]);

	return (
		<View className="border-border/60 flex-row justify-between rounded-2xl border px-3 py-4">
			<WheelColumn
				data={months}
				value={months[selectedMonth]}
				onSelect={(index) => setSelectedMonth(index)}
			/>
			<WheelColumn
				data={days.map(String)}
				value={String(selectedDay)}
				onSelect={(index) => setSelectedDay(days[index] ?? 1)}
			/>
			<WheelColumn
				data={years.map(String)}
				value={String(selectedYear)}
				onSelect={(index) => setSelectedYear(years[index] ?? 1990)}
			/>
		</View>
	);
}

type WheelColumnProps = {
	data: string[];
	value: string;
	onSelect: (index: number) => void;
};

function WheelColumn({ data, value, onSelect }: WheelColumnProps) {
	const listRef = React.useRef<FlatList<string>>(null);
	const index = Math.max(0, data.indexOf(value));

	React.useEffect(() => {
		listRef.current?.scrollToIndex({ index, animated: false });
	}, [index]);

	return (
		<View className="flex-1 items-center">
			<View className="border-primary/40 absolute top-1/2 right-0 left-0 h-[36px] rounded-xl border" />
			<FlatList
				ref={listRef}
				data={data}
				keyExtractor={(item) => item}
				showsVerticalScrollIndicator={false}
				snapToInterval={ITEM_HEIGHT}
				decelerationRate="fast"
				contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
				getItemLayout={(_, itemIndex) => ({
					length: ITEM_HEIGHT,
					offset: ITEM_HEIGHT * itemIndex,
					index: itemIndex,
				})}
				onMomentumScrollEnd={(event) => {
					const offset = event.nativeEvent.contentOffset.y;
					const nextIndex = Math.round(offset / ITEM_HEIGHT);
					onSelect(Math.max(0, Math.min(data.length - 1, nextIndex)));
				}}
				renderItem={({ item }) => (
					<View
						className="items-center justify-center"
						style={{ height: ITEM_HEIGHT }}
					>
						<Text className="text-muted text-base">{item}</Text>
					</View>
				)}
			/>
		</View>
	);
}
