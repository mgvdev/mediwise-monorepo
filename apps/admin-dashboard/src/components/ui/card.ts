import { cva } from "class-variance-authority";

export const cardVariants = cva(
	"border-border/60 bg-card/70 rounded-3xl border p-5 shadow-sm",
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
