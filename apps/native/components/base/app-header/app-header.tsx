import { Ionicons } from "@expo/vector-icons";
import { cn, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { Image, Pressable, View } from "react-native";
import {
	Body,
	BodyMuted,
	BodyStrong,
	H2,
	Micro,
} from "@/components/base/typography";
import { pressableFeedback } from "@/components/utils";

type AppHeaderVariant = "dark" | "light" | "gradient" | "soft" | "outline";

type AppHeaderProps = {
	title: string;
	subtitle?: string;
	score?: number | null;
	statusLabel?: string;
	memberLabel?: string;
	avatarUri?: string;
	notificationCount?: number;
	showChevron?: boolean;
	variant?: AppHeaderVariant;
	onPress?: () => void;
	onPressNotification?: () => void;
	onPressScore?: () => void;
	rightAccessory?: ReactNode;
	className?: string;
};

const variantStyles: Record<
	AppHeaderVariant,
	{
		container: string;
		title: string;
		subtitle: string;
		row: string;
		scoreText: string;
		statusText: string;
		memberText: string;
	}
> = {
	dark: {
		container: "bg-[#1f2937]",
		title: "text-white",
		subtitle: "text-white/70",
		row: "text-white",
		scoreText: "text-white",
		statusText: "text-white",
		memberText: "text-white/80",
	},
	light: {
		container: "bg-background",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		scoreText: "text-foreground",
		statusText: "text-foreground",
		memberText: "text-muted",
	},
	gradient: {
		container: "bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#111827]",
		title: "text-white",
		subtitle: "text-white/70",
		row: "text-white",
		scoreText: "text-white",
		statusText: "text-white",
		memberText: "text-white/80",
	},
	soft: {
		container: "bg-primary/10",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		scoreText: "text-foreground",
		statusText: "text-foreground",
		memberText: "text-muted",
	},
	outline: {
		container: "bg-panel-background border border-panel-border",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		scoreText: "text-foreground",
		statusText: "text-foreground",
		memberText: "text-muted",
	},
};

function NotificationBadge({ count }: { count: number }) {
	if (!count) return null;
	return (
		<View className="absolute -top-1 -right-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1">
			<Micro className="text-white">{count}</Micro>
		</View>
	);
}

function ScoreRing({
	score,
	onPress,
	textClassName,
}: {
	score: number;
	onPress?: () => void;
	textClassName?: string;
}) {
	const ring = (
		<View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary/70 bg-primary/10">
			<BodyStrong className={cn("text-xl", textClassName)}>
				{Math.round(score)}
			</BodyStrong>
		</View>
	);

	if (!onPress) return ring;

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel="Open score details"
			style={pressableFeedback()}
		>
			{ring}
		</Pressable>
	);
}

function useVariantTokens(variant: AppHeaderVariant) {
	const accent = useThemeColor("primary");
	const styles = variantStyles[variant];
	const iconColor =
		variant === "dark" || variant === "gradient" ? "white" : accent;

	return { accent, styles, iconColor };
}

function AppHeaderContainer({
	children,
	variant = "dark",
	onPress,
	className,
}: {
	children: ReactNode;
	variant?: AppHeaderVariant;
	onPress?: () => void;
	className?: string;
}) {
	const { styles } = useVariantTokens(variant);
	const containerClassName = cn(
		"rounded-3xl px-5 pt-5 pb-4",
		styles.container,
		className,
	);

	if (onPress) {
		return (
			<Pressable
				className={containerClassName}
				onPress={onPress}
				style={pressableFeedback()}
			>
				{children}
			</Pressable>
		);
	}

	return <View className={containerClassName}>{children}</View>;
}

function AppHeaderAvatar({ avatarUri }: { avatarUri?: string }) {
	return avatarUri ? (
		<Image source={{ uri: avatarUri }} className="h-10 w-10 rounded-full" />
	) : (
		<View className="h-10 w-10 rounded-full bg-panel-border/60" />
	);
}

function AppHeaderTitle({
	title,
	subtitle,
	variant = "dark",
}: {
	title: string;
	subtitle?: string;
	variant?: AppHeaderVariant;
}) {
	const { styles } = useVariantTokens(variant);

	return (
		<View>
			<H2 className={styles.title}>{title}</H2>
			{subtitle ? (
				<BodyMuted className={styles.subtitle}>{subtitle}</BodyMuted>
			) : null}
		</View>
	);
}

function AppHeaderNotification({
	count = 0,
	variant = "dark",
	onPress,
}: {
	count?: number;
	variant?: AppHeaderVariant;
	onPress?: () => void;
}) {
	const { iconColor } = useVariantTokens(variant);

	return (
		<Pressable
			onPress={onPress}
			className="h-10 w-10 items-center justify-center rounded-full"
			accessibilityRole="button"
			accessibilityLabel="Notifications"
			style={pressableFeedback()}
		>
			<Ionicons name="notifications-outline" size={22} color={iconColor} />
			<NotificationBadge count={count} />
		</Pressable>
	);
}

function AppHeaderScore({
	score,
	variant = "dark",
	onPress,
}: {
	score?: number | null;
	variant?: AppHeaderVariant;
	onPress?: () => void;
}) {
	const { styles } = useVariantTokens(variant);
	if (score === null || score === undefined) return null;

	return (
		<ScoreRing
			score={score}
			onPress={onPress}
			textClassName={styles.scoreText}
		/>
	);
}

function AppHeaderStatus({
	statusLabel,
	memberLabel,
	variant = "dark",
}: {
	statusLabel?: string;
	memberLabel?: string;
	variant?: AppHeaderVariant;
}) {
	const { accent, styles, iconColor } = useVariantTokens(variant);
	if (!statusLabel && !memberLabel) return null;

	return (
		<View className="flex-row items-center gap-2">
			{statusLabel ? (
				<>
					<Ionicons
						name="heart"
						size={16}
						color={
							variant === "dark" || variant === "gradient" ? "#FCA5A5" : accent
						}
					/>
					<Body className={styles.statusText}>{statusLabel}</Body>
				</>
			) : null}
			{statusLabel && memberLabel ? (
				<View className="mx-1 h-1 w-1 rounded-full bg-muted" />
			) : null}
			{memberLabel ? (
				<View className="flex-row items-center gap-1">
					<Ionicons
						name="sparkles"
						size={16}
						color={
							variant === "dark" || variant === "gradient"
								? "#A78BFA"
								: iconColor
						}
					/>
					<Body className={styles.memberText}>{memberLabel}</Body>
				</View>
			) : null}
		</View>
	);
}

function AppHeaderChevron({
	variant = "dark",
}: {
	variant?: AppHeaderVariant;
}) {
	const { iconColor } = useVariantTokens(variant);
	return <Ionicons name="chevron-forward" size={20} color={iconColor} />;
}

export function AppHeader({
	title,
	subtitle,
	score,
	statusLabel,
	memberLabel,
	avatarUri,
	notificationCount = 0,
	showChevron = true,
	variant = "dark",
	onPress,
	onPressNotification,
	onPressScore,
	rightAccessory,
	className,
}: AppHeaderProps) {
	return (
		<AppHeaderContainer
			variant={variant}
			onPress={onPress}
			className={className}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center gap-3">
					<AppHeaderAvatar avatarUri={avatarUri} />
					<AppHeaderTitle title={title} subtitle={subtitle} variant={variant} />
				</View>
				<View className="flex-row items-center gap-3">
					{rightAccessory}
					<AppHeaderNotification
						count={notificationCount}
						variant={variant}
						onPress={onPressNotification}
					/>
				</View>
			</View>

			{score !== null || statusLabel || memberLabel ? (
				<View className="mt-4 flex-row items-center gap-4">
					<AppHeaderScore
						score={score}
						variant={variant}
						onPress={onPressScore}
					/>
					<View className="flex-1">
						<AppHeaderStatus
							statusLabel={statusLabel}
							memberLabel={memberLabel}
							variant={variant}
						/>
					</View>
					{showChevron ? <AppHeaderChevron variant={variant} /> : null}
				</View>
			) : null}
		</AppHeaderContainer>
	);
}

export {
	AppHeaderAvatar,
	AppHeaderChevron,
	AppHeaderContainer,
	AppHeaderNotification,
	AppHeaderScore,
	AppHeaderStatus,
	AppHeaderTitle,
};

export type { AppHeaderProps, AppHeaderVariant };
