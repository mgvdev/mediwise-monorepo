import { mongoose, Tenant, User } from "@mediwise-monorepo/db";

type SessionUser = {
	id: string;
	email?: string | null;
	tenantId?: string | null;
};

export type ViewerTenant = {
	name: string;
	logoUrl: string | null;
};

export type Viewer = {
	tenant: ViewerTenant | null;
};

const DEMO_TENANT_ID = "demo-tenant";

function buildUserFilter(user: SessionUser) {
	const filters: Record<string, unknown>[] = [];
	if (user.id) {
		const isObjectId = mongoose.Types.ObjectId.isValid(user.id);
		filters.push({
			_id: isObjectId ? new mongoose.Types.ObjectId(user.id) : user.id,
		});
	}
	if (user.email) {
		filters.push({ email: user.email.toLowerCase() });
	}
	if (!filters.length) {
		throw new Error("User filter is empty.");
	}
	return filters.length === 1 ? filters[0] : { $or: filters };
}

async function resolveTenantId(user: SessionUser): Promise<string | null> {
	if (user.tenantId) {
		return user.tenantId;
	}
	const found = await User.findOne(buildUserFilter(user)).lean<{
		tenantId?: string | null;
	} | null>();
	return found?.tenantId ?? null;
}

export async function getViewer(user: SessionUser): Promise<Viewer> {
	const tenantId = await resolveTenantId(user);
	if (!tenantId || tenantId === DEMO_TENANT_ID) {
		return { tenant: null };
	}
	const tenant = await Tenant.findById(tenantId).lean<{
		name?: string | null;
		logoUrl?: string | null;
	} | null>();
	if (!tenant?.name) {
		return { tenant: null };
	}
	return { tenant: { name: tenant.name, logoUrl: tenant.logoUrl ?? null } };
}
