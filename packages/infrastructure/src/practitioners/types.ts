export type PractitionerSource = "manual" | "document";

export type PractitionerDoc = {
	_id: string;
	userId: string;
	tenantId: string | null;
	firstName?: string | null;
	lastName: string;
	specialty: string;
	specialtyOther?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	notes?: string | null;
	source: PractitionerSource;
	createdAt: Date;
	updatedAt?: Date | null;
};

export type PractitionerFields = {
	firstName?: string | null;
	lastName: string;
	specialty: string;
	specialtyOther?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	notes?: string | null;
};

/** A doctor name found in the user's documents, with how many times it appears. */
export type DocumentDoctorName = {
	name: string;
	occurrences: number;
};
