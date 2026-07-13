export type ReminderDoc = {
	_id: string;
	userId: string;
	tenantId?: string | null;
	medicationName: string;
	medicationDosage?: string | null;
	enabled: boolean;
	moments: string[];
	timeOverrides?: Record<string, string> | null;
	daysOfWeek?: number[] | null;
	createdAt: Date;
	updatedAt: Date;
};

export type ReminderSettingsDoc = {
	_id: string;
	userId: string;
	tenantId?: string | null;
	timeMap: Record<string, string>;
	updatedAt: Date;
};

export type UpsertReminderInput = {
	userId: string;
	tenantId?: string | null;
	medicationName: string;
	medicationDosage?: string | null;
	enabled: boolean;
	moments: string[];
	timeOverrides?: Record<string, string> | null;
	daysOfWeek?: number[] | null;
};
