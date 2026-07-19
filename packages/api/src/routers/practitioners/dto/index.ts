import { z } from "zod";

export const practitionerSaveInput = z
	.object({
		id: z.string().optional().nullable(),
		firstName: z.string().optional().nullable(),
		lastName: z.string().min(1),
		specialty: z.string().min(1),
		specialtyOther: z.string().optional().nullable(),
		phone: z.string().optional().nullable(),
		email: z.string().optional().nullable(),
		address: z.string().optional().nullable(),
		notes: z.string().optional().nullable(),
		// Only honoured on create; an update never changes the source.
		source: z.enum(["manual", "document"]).optional().nullable(),
	})
	.refine(
		(value) =>
			value.specialty !== "other" || Boolean(value.specialtyOther?.trim()),
		{
			message: "Describe the specialty.",
			path: ["specialtyOther"],
		},
	);

export type PractitionerSaveInput = z.infer<typeof practitionerSaveInput>;

export const practitionerListInput = z.object({
	search: z.string().optional().nullable(),
});

export const practitionerIdInput = z.object({
	id: z.string().min(1),
});
