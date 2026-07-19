import type { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type Petal = {
	key: string;
	label: string;
	icon: IoniconName;
	/** Base petal color (hex). */
	color: string;
	/** Lighter tint used for the top of the petal gradient (hex). */
	tint: string;
	/** Destination route when the petal is tapped. */
	route: string;
	/**
	 * Angle in degrees where the petal sits around the flower, measured with
	 * 0deg = up and increasing clockwise. Also used to rotate the petal so its
	 * long axis points outward.
	 */
	angle: number;
};

/**
 * Five petals arranged as a flower. Labels are English (Ordonnance/Suivi/
 * Agenda/Praticiens/Documents in the original mockup). Colors mirror the
 * mockup: teal, green, yellow, blue, orange.
 */
export const PETALS: Petal[] = [
	{
		key: "prescriptions",
		label: "Prescriptions",
		icon: "medical-outline",
		color: "#2FB89C",
		tint: "#63D3B9",
		route: "/prescriptions",
		angle: 0,
	},
	{
		key: "calendar",
		label: "Calendar",
		icon: "calendar-outline",
		color: "#57BE8C",
		tint: "#84D6AC",
		route: "/calendar",
		angle: 72,
	},
	{
		key: "documents",
		label: "Documents",
		icon: "document-text-outline",
		color: "#E4885C",
		tint: "#F0A97F",
		route: "/documents",
		angle: 144,
	},
	{
		key: "practitioners",
		label: "Practitioners",
		icon: "person-outline",
		color: "#6BA0DE",
		tint: "#9BC0EC",
		route: "/practitioners",
		angle: 216,
	},
	{
		key: "tracking",
		label: "Tracking",
		icon: "pulse-outline",
		color: "#E6B549",
		tint: "#F1CE7C",
		route: "/health/overview",
		angle: 288,
	},
];

/** Center "heart" — tap to talk to the assistant. */
export const CENTER = {
	route: "/ai",
	color: "#2FB89C",
	tint: "#7FE0CC",
};
