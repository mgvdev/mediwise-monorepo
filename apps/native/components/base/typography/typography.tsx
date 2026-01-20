import { cn } from "heroui-native";
import type { TextProps } from "react-native";
import { Text } from "react-native";

type TypographyProps = TextProps & {
	className?: string;
};

export function Display({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-3xl text-foreground", className)}
			{...props}
		/>
	);
}

export function H1({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-2xl text-foreground", className)}
			{...props}
		/>
	);
}

export function H2({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-foreground text-xl", className)}
			{...props}
		/>
	);
}

export function H3({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-foreground text-lg", className)}
			{...props}
		/>
	);
}

export function Title({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-base text-foreground", className)}
			{...props}
		/>
	);
}

export function Subtitle({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-medium text-muted text-sm", className)}
			{...props}
		/>
	);
}

export function Body({ className, ...props }: TypographyProps) {
	return (
		<Text className={cn("text-foreground text-sm", className)} {...props} />
	);
}

export function BodyMedium({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-medium text-foreground text-sm", className)}
			{...props}
		/>
	);
}

export function BodyMuted({ className, ...props }: TypographyProps) {
	return <Text className={cn("text-muted text-sm", className)} {...props} />;
}

export function BodyStrong({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-foreground text-sm", className)}
			{...props}
		/>
	);
}

export function Caption({ className, ...props }: TypographyProps) {
	return <Text className={cn("text-muted text-xs", className)} {...props} />;
}

export function CaptionStrong({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-muted text-xs", className)}
			{...props}
		/>
	);
}

export function Micro({ className, ...props }: TypographyProps) {
	return (
		<Text className={cn("text-[11px] text-muted", className)} {...props} />
	);
}

export function MicroStrong({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-[11px] text-muted", className)}
			{...props}
		/>
	);
}

export function Overline({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn(
				"font-semibold text-muted text-xs uppercase tracking-wide",
				className,
			)}
			{...props}
		/>
	);
}

export function Link({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("font-semibold text-primary text-sm", className)}
			{...props}
		/>
	);
}

export function Emoji({ className, ...props }: TypographyProps) {
	return <Text className={cn("text-4xl", className)} {...props} />;
}
