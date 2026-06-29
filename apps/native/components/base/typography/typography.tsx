import { cn } from "heroui-native";
import type { TextProps } from "react-native";
import { Text } from "react-native";

type TypographyProps = TextProps & {
	className?: string;
};

export function Display({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-foreground text-3xl font-semibold", className)}
			{...props}
		/>
	);
}

export function H1({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-foreground text-2xl font-semibold", className)}
			{...props}
		/>
	);
}

export function H2({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-foreground text-xl font-semibold", className)}
			{...props}
		/>
	);
}

export function H3({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-foreground text-lg font-semibold", className)}
			{...props}
		/>
	);
}

export function Title({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-foreground text-base font-semibold", className)}
			{...props}
		/>
	);
}

export function Subtitle({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-muted text-sm font-medium", className)}
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
			className={cn("text-foreground text-sm font-medium", className)}
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
			className={cn("text-foreground text-sm font-semibold", className)}
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
			className={cn("text-muted text-xs font-semibold", className)}
			{...props}
		/>
	);
}

export function Micro({ className, ...props }: TypographyProps) {
	return (
		<Text className={cn("text-muted text-[11px]", className)} {...props} />
	);
}

export function MicroStrong({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-muted text-[11px] font-semibold", className)}
			{...props}
		/>
	);
}

export function Overline({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn(
				"text-muted text-xs font-semibold tracking-wide uppercase",
				className,
			)}
			{...props}
		/>
	);
}

export function Link({ className, ...props }: TypographyProps) {
	return (
		<Text
			className={cn("text-primary text-sm font-semibold", className)}
			{...props}
		/>
	);
}

export function Emoji({ className, ...props }: TypographyProps) {
	return <Text className={cn("text-4xl", className)} {...props} />;
}
