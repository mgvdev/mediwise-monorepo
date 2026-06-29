import { cn } from "heroui-native";
import { Text, View } from "react-native";

type RecapQRCodeProps = {
	value: string;
	className?: string;
};

function hashString(value: string) {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function buildMatrix(value: string, size = 9) {
	const seed = hashString(value || "recap");
	const matrix: Array<{ key: string; row: boolean[] }> = [];
	for (let y = 0; y < size; y += 1) {
		const row: boolean[] = [];
		for (let x = 0; x < size; x += 1) {
			const bit = (seed >> ((x + y * size) % 31)) & 1;
			row.push(bit === 1);
		}
		matrix.push({ key: `${seed}-${y}`, row });
	}
	return matrix;
}

export function RecapQRCode({ value, className }: RecapQRCodeProps) {
	const matrix = buildMatrix(value);

	return (
		<View className={cn("items-center gap-3", className)}>
			<View className="border-panel-border rounded-2xl border bg-white p-3">
				<View className="gap-1">
					{matrix.map(({ key, row }) => (
						<View key={key} className="flex-row gap-1">
							{row.map((cell, colIndex) => (
								<View
									key={`${key}-${colIndex}-${cell ? "1" : "0"}`}
									className={cn(
										"h-3 w-3 rounded-[2px]",
										cell ? "bg-foreground" : "bg-transparent",
									)}
								/>
							))}
						</View>
					))}
				</View>
			</View>
			<Text className="text-muted text-xs">Show this QR to your doctor</Text>
		</View>
	);
}
