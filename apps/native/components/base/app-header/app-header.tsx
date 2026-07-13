import { Ionicons } from "@expo/vector-icons";
import { cn, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { Image, Pressable, View } from "react-native";

import { BodyMuted, H2, Micro } from "@/components/base/typography";
import { pressableFeedback } from "@/components/utils";

type AppHeaderVariant = "dark" | "light" | "gradient" | "soft" | "outline";

type AppHeaderProps = {
	title: string;
	subtitle?: string;
	insurerName?: string | null;
	insurerLogoUrl?: string | null;
	avatarUri?: string;
	notificationCount?: number;
	showChevron?: boolean;
	variant?: AppHeaderVariant;
	onPress?: () => void;
	onPressNotification?: () => void;
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
		divider: string;
		insurerText: string;
	}
> = {
	dark: {
		container: "bg-[#1f2937]",
		title: "text-white",
		subtitle: "text-white/70",
		row: "text-white",
		divider: "border-white/10",
		insurerText: "text-white/70",
	},
	light: {
		container: "bg-background",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		divider: "border-panel-border",
		insurerText: "text-muted",
	},
	gradient: {
		container: "bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#111827]",
		title: "text-white",
		subtitle: "text-white/70",
		row: "text-white",
		divider: "border-white/10",
		insurerText: "text-white/70",
	},
	soft: {
		container: "bg-primary/10",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		divider: "border-panel-border",
		insurerText: "text-muted",
	},
	outline: {
		container: "bg-panel-background border border-panel-border",
		title: "text-foreground",
		subtitle: "text-muted",
		row: "text-foreground",
		divider: "border-panel-border",
		insurerText: "text-muted",
	},
};

function NotificationBadge({ count }: { count: number }) {
	if (!count) return null;
	return (
		<View className="bg-danger absolute -top-1 -right-1 h-5 min-w-[20px] items-center justify-center rounded-full px-1">
			<Micro className="text-white">{count}</Micro>
		</View>
	);
}

function useVariantTokens(variant: AppHeaderVariant) {
	const accent = useThemeColor("accent");
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
		<View className="bg-panel-border/60 h-10 w-10 rounded-full" />
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

function AppHeaderInsurer({
	insurerName,
	insurerLogoUrl,
	variant = "dark",
}: {
	insurerName: string;
	insurerLogoUrl?: string | null;
	variant?: AppHeaderVariant;
}) {
	const { styles, iconColor } = useVariantTokens(variant);

	return (
		<View
			className={cn(
				"mt-4 flex-row items-center gap-2 border-t pt-3",
				styles.divider,
			)}
		>
			{insurerLogoUrl ? (
				<Image
					source={{ uri: insurerLogoUrl }}
					className="h-6 w-6 rounded-md"
					resizeMode="contain"
				/>
			) : (
				<Ionicons name="shield-checkmark" size={16} color={iconColor} />
			)}
			<BodyMuted className={styles.insurerText}>
				Provided by {insurerName}
			</BodyMuted>
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
	insurerName,
	insurerLogoUrl,
	avatarUri,
	notificationCount = 0,
	showChevron = false,
	variant = "dark",
	onPress,
	onPressNotification,
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
					{showChevron ? <AppHeaderChevron variant={variant} /> : null}
				</View>
			</View>

			{insurerName ? (
				<AppHeaderInsurer
					insurerName={insurerName}
					insurerLogoUrl={insurerLogoUrl}
					variant={variant}
				/>
			) : null}
		</AppHeaderContainer>
	);
}

export type { AppHeaderProps, AppHeaderVariant };
export {
	AppHeaderAvatar,
	AppHeaderChevron,
	AppHeaderContainer,
	AppHeaderInsurer,
	AppHeaderNotification,
	AppHeaderTitle,
};
