export function applyOpacity(color: string, opacity: number) {
	if (!color.startsWith("#")) return null;
	const hex = color.replace("#", "");
	const normalized =
		hex.length === 3
			? hex
					.split("")
					.map((char) => char + char)
					.join("")
			: hex;
	if (normalized.length !== 6) return null;
	const red = Number.parseInt(normalized.slice(0, 2), 16);
	const green = Number.parseInt(normalized.slice(2, 4), 16);
	const blue = Number.parseInt(normalized.slice(4, 6), 16);
	return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

type Rgb = { red: number; green: number; blue: number };

function parseHexColor(color: string): Rgb | null {
	if (!color.startsWith("#")) return null;
	const hex = color.replace("#", "");
	const normalized =
		hex.length === 3
			? hex
					.split("")
					.map((char) => char + char)
					.join("")
			: hex;
	if (normalized.length !== 6) return null;
	return {
		red: Number.parseInt(normalized.slice(0, 2), 16),
		green: Number.parseInt(normalized.slice(2, 4), 16),
		blue: Number.parseInt(normalized.slice(4, 6), 16),
	};
}

export function getRelativeLuminance(color: string) {
	const rgb = parseHexColor(color);
	if (!rgb) return null;
	const channel = (value: number) => {
		const normalized = value / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	};
	return (
		0.2126 * channel(rgb.red) +
		0.7152 * channel(rgb.green) +
		0.0722 * channel(rgb.blue)
	);
}
