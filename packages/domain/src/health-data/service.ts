import { mongoose, User } from "@mediwise-monorepo/db";
import { decryptHealthPayload, encryptHealthPayload } from "./encryption";

type HealthDataValue = string | string[] | null;
type CategoryValues = Record<string, HealthDataValue>;
type HealthDataMap = Record<string, CategoryValues>;

export type HealthDataSaveInput = {
	categoryKey: string;
	values: Record<string, HealthDataValue>;
};

type StoredHealthData = {
	personal?: HealthDataMap;
	encrypted?: string | null;
	onboarding?: {
		currentCategoryKey?: string | null;
		startedAt?: Date;
		completedAt?: Date;
	};
	updatedAt?: Date;
};

const PERSONAL_CATEGORY_KEY = "personal_information";

type SessionUser = {
	id: string;
	email?: string | null;
};

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

function decodeSensitive(payload: string | null | undefined) {
	return decryptHealthPayload(payload) as HealthDataMap;
}

export async function getHealthData(user: SessionUser) {
	const filter = buildUserFilter(user);
	const found = await User.findOne(filter).lean<{
		healthData?: StoredHealthData;
		onboardedAt?: Date;
	} | null>();
	const stored = found?.healthData ?? {};
	if (!found) {
		return {
			data: {},
			updatedAt: null,
			onboarding: null,
			onboardedAt: null,
		};
	}
	const personal = stored.personal ?? {};
	const sensitive = decodeSensitive(stored.encrypted);
	return {
		data: {
			...sensitive,
			...personal,
		},
		updatedAt: stored.updatedAt ?? null,
		onboarding: stored.onboarding ?? null,
		onboardedAt: found.onboardedAt ?? null,
	};
}

export async function saveHealthData(params: {
	user: SessionUser;
	input: HealthDataSaveInput;
}) {
	const { user, input } = params;
	const filter = buildUserFilter(user);
	const found = await User.findOne(filter).lean<{
		healthData?: StoredHealthData;
	} | null>();
	if (!found) {
		throw new Error("User not found.");
	}

	const stored = found.healthData ?? {};
	const personal = stored.personal ?? {};
	const sensitive = decodeSensitive(stored.encrypted);

	let nextPersonal = personal;
	let nextSensitive = sensitive;

	if (input.categoryKey === PERSONAL_CATEGORY_KEY) {
		nextPersonal = {
			...personal,
			[PERSONAL_CATEGORY_KEY]: input.values,
		};
	} else {
		nextSensitive = {
			...sensitive,
			[input.categoryKey]: input.values,
		};
	}

	const encrypted = encryptHealthPayload(nextSensitive);
	const updatedAt = new Date();

	await User.findOneAndUpdate(filter, {
		$set: {
			healthData: {
				...stored,
				personal: nextPersonal,
				encrypted,
				updatedAt,
			},
		},
	});

	return { updatedAt };
}

export async function setOnboardingStep(params: {
	user: SessionUser;
	categoryKey: string;
}) {
	const { user, categoryKey } = params;
	const filter = buildUserFilter(user);
	const now = new Date();
	await User.findOneAndUpdate(filter, {
		$set: {
			"healthData.onboarding.currentCategoryKey": categoryKey,
			"healthData.onboarding.startedAt": now,
		},
	});
	return { currentCategoryKey: categoryKey };
}

export async function completeOnboarding(params: { user: SessionUser }) {
	const { user } = params;
	const filter = buildUserFilter(user);
	const now = new Date();
	await User.findOneAndUpdate(filter, {
		$set: {
			onboardedAt: now,
			"healthData.onboarding.completedAt": now,
			"healthData.onboarding.currentCategoryKey": null,
		},
	});
	return { onboardedAt: now };
}
