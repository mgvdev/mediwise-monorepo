import { cn } from "heroui-native";
import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

type StackProps = ViewProps & {
    className?: string;
};

type ZStackProps = ViewProps & {
    className?: string;
    overlayClassName?: string;
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    children?: ReactNode;
};

const ALIGN_CLASSES: Record<NonNullable<ZStackProps["align"]>, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
};

const JUSTIFY_CLASSES: Record<NonNullable<ZStackProps["justify"]>, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
};

export function VerticalStack({ className, ...props }: StackProps) {
    return <View className={cn("gap-4", className)} {...props} />;
}

export function HorizontalStack({ className, ...props }: StackProps) {
    return <View className={cn("flex-row gap-4", className)} {...props} />;
}

export function ZStack({
    className,
    overlayClassName,
    align = "center",
    justify = "center",
    children,
    ...props
}: ZStackProps) {
    const alignment = cn(ALIGN_CLASSES[align], JUSTIFY_CLASSES[justify]);
    const layers = Array.isArray(children)
        ? children
        : children
          ? [children]
          : [];

    return (
        <View className={cn("relative", className)} {...props}>
            {layers.map((child, index) => {
                if (child == null) return null;
                if (index === 0) {
                    return (
                        <View key={`layer-${index}`} className={alignment}>
                            {child}
                        </View>
                    );
                }

                return (
                    <View
                        key={`layer-${index}`}
                        pointerEvents="box-none"
                        className={cn(
                            "absolute inset-0",
                            alignment,
                            overlayClassName,
                        )}
                    >
                        {child}
                    </View>
                );
            })}
        </View>
    );
}

export { VerticalStack as Stack };
