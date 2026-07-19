export type AppointmentDoc = {
	_id: string;
	userId: string;
	tenantId: string | null;
	practitionerId?: string | null;
	practitionerName?: string | null;
	startAt: Date;
	reason?: string | null;
	location?: string | null;
	notes?: string | null;
	reminderOffsetMinutes?: number | null;
	createdAt: Date;
	updatedAt?: Date | null;
};

export type AppointmentFields = {
	practitionerId?: string | null;
	practitionerName?: string | null;
	startAt: Date;
	reason?: string | null;
	location?: string | null;
	notes?: string | null;
	reminderOffsetMinutes?: number | null;
};
