import { cn } from "heroui-native";
import type { PressableProps, TextProps, ViewProps } from "react-native";
import { Pressable, Text, View } from "react-native";

type CardProps = ViewProps & {
	className?: string;
};

export function Card({ className, ...props }: CardProps) {
	return (
		<View
			className={cn(
				"rounded-2xl border border-panel-border bg-panel-background p-4",
				className,
			)}
			{...props}
		/>
	);
}

type CardHeaderProps = ViewProps & {
	className?: string;
};

export function CardHeader({ className, ...props }: CardHeaderProps) {
	return (
		<View
			className={cn("flex-row items-center justify-between", className)}
			{...props}
		/>
	);
}

type CardTitleProps = TextProps & {
	className?: string;
};

export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<Text
			className={cn("font-semibold text-base text-foreground", className)}
			{...props}
		/>
	);
}

type CardActionProps = PressableProps & {
	className?: string;
};

export function CardAction({ className, ...props }: CardActionProps) {
	return (
		<Pressable
			className={cn(
				"items-center justify-center rounded-full border border-panel-border bg-white/70 px-3 py-1",
				className,
			)}
			{...props}
		/>
	);
}

type CardBodyProps = ViewProps & {
	className?: string;
};

export function CardBody({ className, ...props }: CardBodyProps) {
	return <View className={cn("mt-3 gap-2", className)} {...props} />;
}

type CardFooterProps = ViewProps & {
	className?: string;
};

export function CardFooter({ className, ...props }: CardFooterProps) {
	return <View className={cn("mt-4", className)} {...props} />;
}
