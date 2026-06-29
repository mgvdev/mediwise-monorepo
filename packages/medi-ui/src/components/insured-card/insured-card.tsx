import { Card } from "@heroui/react";
import type { ComponentPropsWithoutRef } from "react";

const cx = (...classes: Array<string | null | undefined | false>) =>
	classes.filter(Boolean).join(" ");

export function InsuredCard({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Card>) {
	return (
		<Card
			className={cx(
				"rounded-3xl border border-border/70 bg-card/70 p-6",
				className,
			)}
			{...props}
		/>
	);
}

export function InsuredHeader({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Card.Header>) {
	return (
		<Card.Header
			className={cx(
				"flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
				className,
			)}
			{...props}
		/>
	);
}

type InsuredScoreProps = ComponentPropsWithoutRef<"div"> & {
	score: string | number;
	label?: string;
};

export function InsuredScore({
	score,
	label = "Health score",
	className,
	...props
}: InsuredScoreProps) {
	return (
		<div
			className={cx("flex min-w-[120px] flex-col gap-1", className)}
			{...props}
		>
			<span className="text-muted-foreground text-xs tracking-wide uppercase">
				{label}
			</span>
			<span className="text-3xl font-semibold">{score}</span>
		</div>
	);
}

type InsuredInfoProps = ComponentPropsWithoutRef<"div"> & {
	label: string;
	value: string;
};

export function InsuredInfo({
	label,
	value,
	className,
	...props
}: InsuredInfoProps) {
	return (
		<div className={cx("min-w-[140px] space-y-1", className)} {...props}>
			<p className="text-muted-foreground text-xs tracking-wide uppercase">
				{label}
			</p>
			<p className="text-foreground text-sm font-medium">{value}</p>
		</div>
	);
}

type InsuredQrCodeProps = ComponentPropsWithoutRef<"div"> & {
	src?: string;
	alt?: string;
};

export function InsuredQrCode({
	src,
	alt = "Insured QR code",
	className,
	...props
}: InsuredQrCodeProps) {
	return (
		<div
			className={cx(
				"flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-muted-foreground text-xs",
				className,
			)}
			{...props}
		>
			{src ? (
				<img
					src={src}
					alt={alt}
					className="h-full w-full rounded-2xl object-cover"
				/>
			) : (
				"QR"
			)}
		</div>
	);
}

export function InsuredBody({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Card.Content>) {
	return (
		<Card.Content
			className={cx("mt-6 grid gap-4 md:grid-cols-3", className)}
			{...props}
		/>
	);
}

export function InsuredCardFooter({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Card.Footer>) {
	return (
		<Card.Footer
			className={cx(
				"mt-6 flex flex-col gap-3 border-border/70 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
				className,
			)}
			{...props}
		/>
	);
}

export function InsuredActions({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cx("flex items-center gap-2", className)} {...props} />
	);
}
