export type RecapSection = {
	id: string;
	label: string;
	description?: string;
};

export type RecapMethod = "qr" | "pdf";

export type RecapSelection = {
	sectionIds: string[];
	method: RecapMethod;
	email?: string;
};
