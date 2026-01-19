import { cn } from "heroui-native";
import type { ViewProps } from "react-native";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import {
	MEDICATION_SHAPE_GROUPS_EN,
	SHAPE_LABELS_EN,
} from "./medication-shape.constants";

type MedicationShapeId =
	| "round"
	| "oval"
	| "oblong"
	| "cylindrical"
	| "biconvex"
	| "flat"
	| "square"
	| "rectangular"
	| "triangular"
	| "diamond"
	| "heart"
	| "almond"
	| "capsule"
	| "oral-solution"
	| "oral-suspension"
	| "syrup"
	| "oral-drops"
	| "emulsion"
	| "injectable-solution"
	| "injectable-suspension"
	| "powder-injection"
	| "eye-drops"
	| "ear-drops"
	| "nasal-drops"
	| "mouthwash"
	| "cream"
	| "ointment"
	| "gel"
	| "balm"
	| "lotion"
	| "mousse"
	| "paste"
	| "ophthalmic-gel"
	| "vaginal-gel"
	| "rectal-gel"
	| "metered-aerosol"
	| "nasal-spray"
	| "dry-powder-inhaler"
	| "nebulization"
	| "medical-gas"
	| "oral-spray"
	| "lozenge"
	| "sublingual-tablet"
	| "orodispersible-film"
	| "transdermal-patch"
	| "cutaneous-device"
	| "nanoparticles"
	| "microspheres"
	| "controlled-release"
	| "biologics";

type MedicationShapeProps = ViewProps & {
	shape: MedicationShapeId;
	label?: string;
	size?: number;
	showLabel?: boolean;
	iconSize?: number;
	className?: string;
};

const STROKE = "currentColor";
const STROKE_WIDTH = 2;

function CapsuleIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 44 24" className="text-muted">
			<Rect
				x={2}
				y={2}
				width={40}
				height={20}
				rx={10}
				ry={10}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={22}
				y1={4}
				x2={22}
				y2={20}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function RoundIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 32" className="text-muted">
			<Circle
				cx={16}
				cy={16}
				r={12}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={16}
				y1={6}
				x2={16}
				y2={26}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function RectIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 36 28" className="text-muted">
			<Rect
				x={2}
				y={2}
				width={32}
				height={24}
				rx={4}
				ry={4}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={18}
				y1={4}
				x2={18}
				y2={24}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function TriangleIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 34 30" className="text-muted">
			<Path
				d="M17 3 L31 26 H3 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={17}
				y1={6}
				x2={17}
				y2={24}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function DiamondIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 34 34" className="text-muted">
			<Path
				d="M17 3 L31 17 L17 31 L3 17 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={17}
				y1={6}
				x2={17}
				y2={28}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function HexIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 36 32" className="text-muted">
			<Path
				d="M10 3 L26 3 L33 16 L26 29 L10 29 L3 16 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Line
				x1={18}
				y1={6}
				x2={18}
				y2={26}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function HeartIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 28" className="text-muted">
			<Path
				d="M16 25 C7 17 3 13 3 8 C3 5 5 3 8 3 C11 3 13 5 16 8 C19 5 21 3 24 3 C27 3 29 5 29 8 C29 13 25 17 16 25 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
		</Svg>
	);
}

function AlmondIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 28" className="text-muted">
			<Path
				d="M16 3 C8 6 5 12 5 16 C5 20 8 25 16 25 C24 25 27 20 27 16 C27 12 24 6 16 3 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
		</Svg>
	);
}

function DropIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 28 32" className="text-muted">
			<Path
				d="M14 2 C14 2 5 12 5 19 C5 25 9 29 14 29 C19 29 23 25 23 19 C23 12 14 2 14 2 Z"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
		</Svg>
	);
}

function BottleIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 28 34" className="text-muted">
			<Rect
				x={9}
				y={2}
				width={10}
				height={6}
				rx={2}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Rect
				x={6}
				y={8}
				width={16}
				height={22}
				rx={4}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Line
				x1={14}
				y1={10}
				x2={14}
				y2={28}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function VialIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 28 34" className="text-muted">
			<Rect
				x={8}
				y={2}
				width={12}
				height={6}
				rx={2}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Rect
				x={6}
				y={8}
				width={16}
				height={20}
				rx={3}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Line
				x1={6}
				y1={14}
				x2={22}
				y2={14}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function SprayIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 34 28" className="text-muted">
			<Rect
				x={6}
				y={6}
				width={16}
				height={16}
				rx={4}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Path d="M22 10 H30" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
			<Path d="M22 14 H30" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
			<Path d="M22 18 H30" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
		</Svg>
	);
}

function PatchIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 28" className="text-muted">
			<Rect
				x={4}
				y={4}
				width={24}
				height={20}
				rx={4}
				fill="none"
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
			<Line
				x1={8}
				y1={8}
				x2={24}
				y2={20}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
			/>
		</Svg>
	);
}

function BubblesIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 28" className="text-muted">
			<Circle
				cx={10}
				cy={10}
				r={4}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Circle
				cx={20}
				cy={8}
				r={3}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Circle
				cx={22}
				cy={18}
				r={5}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
		</Svg>
	);
}

function ControlledIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 32 28" className="text-muted">
			<Circle
				cx={16}
				cy={14}
				r={9}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
			<Path d="M16 5 V9" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
			<Path d="M16 19 V23" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
			<Path d="M7 14 H11" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
			<Path d="M21 14 H25" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
		</Svg>
	);
}

const SHAPE_ICON: Record<MedicationShapeId, () => JSX.Element> = {
	round: RoundIcon,
	oval: CapsuleIcon,
	oblong: CapsuleIcon,
	cylindrical: CapsuleIcon,
	biconvex: CapsuleIcon,
	flat: RectIcon,
	square: RectIcon,
	rectangular: RectIcon,
	triangular: TriangleIcon,
	diamond: DiamondIcon,
	heart: HeartIcon,
	almond: AlmondIcon,
	capsule: CapsuleIcon,
	"oral-solution": BottleIcon,
	"oral-suspension": BottleIcon,
	syrup: BottleIcon,
	"oral-drops": DropIcon,
	emulsion: BottleIcon,
	"injectable-solution": VialIcon,
	"injectable-suspension": VialIcon,
	"powder-injection": VialIcon,
	"eye-drops": DropIcon,
	"ear-drops": DropIcon,
	"nasal-drops": DropIcon,
	mouthwash: BottleIcon,
	cream: RectIcon,
	ointment: RectIcon,
	gel: DropIcon,
	balm: RectIcon,
	lotion: BottleIcon,
	mousse: BottleIcon,
	paste: RectIcon,
	"ophthalmic-gel": DropIcon,
	"vaginal-gel": DropIcon,
	"rectal-gel": DropIcon,
	"metered-aerosol": SprayIcon,
	"nasal-spray": SprayIcon,
	"dry-powder-inhaler": SprayIcon,
	nebulization: SprayIcon,
	"medical-gas": HexIcon,
	"oral-spray": SprayIcon,
	lozenge: RoundIcon,
	"sublingual-tablet": OvalIcon,
	"orodispersible-film": RectIcon,
	"transdermal-patch": PatchIcon,
	"cutaneous-device": PatchIcon,
	nanoparticles: BubblesIcon,
	microspheres: BubblesIcon,
	"controlled-release": ControlledIcon,
	biologics: HexIcon,
};

function OvalIcon() {
	return (
		<Svg width="100%" height="100%" viewBox="0 0 36 24" className="text-muted">
			<Rect
				x={2}
				y={2}
				width={32}
				height={20}
				rx={10}
				ry={10}
				stroke={STROKE}
				strokeWidth={STROKE_WIDTH}
				fill="none"
			/>
		</Svg>
	);
}

export const MEDICATION_SHAPES = Object.keys(
	SHAPE_LABELS_EN,
) as MedicationShapeId[];

export const MEDICATION_SHAPE_GROUPS = MEDICATION_SHAPE_GROUPS_EN;

export function MedicationShape({
	shape,
	label,
	size = 92,
	iconSize = 44,
	showLabel = true,
	className,
	...props
}: MedicationShapeProps) {
	const Icon = SHAPE_ICON[shape] ?? CapsuleIcon;
	const displayLabel = label ?? SHAPE_LABELS_EN[shape];
	return (
		<View
			className={cn("items-center gap-3", className)}
			style={{ width: size }}
			{...props}
		>
			<View
				className="items-center justify-center rounded-full border border-panel-border bg-panel-background"
				style={{ width: size, height: size }}
			>
				<View style={{ width: iconSize, height: iconSize }}>
					<Icon />
				</View>
			</View>
			{showLabel ? (
				<Text className="text-center text-muted text-xs">{displayLabel}</Text>
			) : null}
		</View>
	);
}

export type { MedicationShapeId };
