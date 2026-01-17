import type { ComponentPropsWithoutRef, ReactNode } from "react";

const cx = (...classes: Array<string | null | undefined | false>) =>
	classes.filter(Boolean).join(" ");

export function List({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return <div className={cx("space-y-3", className)} {...props} />;
}

export function ListItem({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cx(
				"flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 md:flex-row md:items-center md:justify-between",
				className,
			)}
			{...props}
		/>
	);
}

export function ListContent({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return <div className={cx("flex-1", className)} {...props} />;
}

export function ListTitle({
	className,
	...props
}: ComponentPropsWithoutRef<"p">) {
	return (
		<p
			className={cx("font-medium text-foreground text-sm", className)}
			{...props}
		/>
	);
}

export function ListDescription({
	className,
	...props
}: ComponentPropsWithoutRef<"p">) {
	return (
		<p className={cx("text-muted-foreground text-xs", className)} {...props} />
	);
}

export function ListActions({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cx("flex items-center gap-3", className)} {...props} />
	);
}

export function ListAction({
	className,
	...props
}: ComponentPropsWithoutRef<"span">) {
	return (
		<span
			className={cx("text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}

type ListPictureProps = {
	src?: string;
	alt?: string;
	children?: ReactNode;
	className?: string;
};

export function ListPicture({
	src,
	alt,
	children,
	className,
}: ListPictureProps) {
	const baseClassName = cx(
		"h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-foreground/5",
		className,
	);

	if (src) {
		return (
			<img
				src={src}
				alt={alt ?? ""}
				className={cx(baseClassName, "object-cover")}
			/>
		);
	}

	return <div className={baseClassName}>{children}</div>;
}
