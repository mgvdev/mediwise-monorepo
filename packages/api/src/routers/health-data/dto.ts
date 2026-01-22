import { z } from "zod";

const healthValue = z.union([z.string(), z.array(z.string()), z.null()]);

export const healthDataSaveInput = z.object({
	categoryKey: z.string().min(1),
	values: z.record(z.string(), healthValue),
});

export type HealthDataSaveInput = z.infer<typeof healthDataSaveInput>;

export const healthDataSetCurrentInput = z.object({
	categoryKey: z.string().min(1),
});
