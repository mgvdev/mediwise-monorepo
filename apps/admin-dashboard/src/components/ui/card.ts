import { cva } from "class-variance-authority";

export const cardVariants = cva(
	"rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm",
	{
		variants: {
			variant: {
				default: "",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);
