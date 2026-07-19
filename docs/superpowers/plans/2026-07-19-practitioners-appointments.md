# Practitioner Directory & Appointments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user keep a directory of their practitioners and record appointments with them, with one push reminder per appointment.

**Architecture:** Two new entities (`practitioner`, `appointment`) follow the existing exams stack: mongoose model in `packages/db` → repository in `packages/infrastructure` → tRPC router in `packages/api` → expo-router screens in `apps/native`. Pure logic that needs tests (document-name dedup, notification schedule) lives in `packages/domain`. Notification scheduling on the client mirrors `apps/native/features/reminders/`.

**Tech Stack:** Bun workspaces + Turborepo, MongoDB via mongoose, tRPC v11 + `@trpc/tanstack-react-query`, Expo Router, heroui-native + NativeWind, expo-notifications, `bun:test`.

**Spec:** `docs/superpowers/specs/2026-07-19-practitioners-appointments-design.md`

## Global Constraints

- All user-facing strings are **English**. No French in code or UI.
- Styling in `apps/native` uses Tailwind/Uniwind `className` with theme tokens (`primary`, `panel-border`, `panel-background`, `muted`, `danger`, `background`, `foreground`). No inline style objects for visuals; use `pressableFeedback()` from `@/components/utils` for press states and `cn` from `heroui-native` for conditional classes.
- Inputs that open popups/bottom sheets are reusable components under `apps/native/components/`, never inline in a screen.
- New screens use the native header with the default `HeaderBack` button.
- Repositories always filter by `userId`. Ownership is never checked in the router.
- Mongoose models declare `_id: { type: String }` and manual `createdAt` / `updatedAt`; never `{ timestamps: true }`. UUIDs come from `randomUUID()` in the repository.
- Code style: tabs for indentation, double quotes, trailing commas (matches `oxfmt`). Run `bun run check` before committing when a task touched several files.
- Verification commands: `bun run check-types` (turbo, whole monorepo) and `bun test <path>` for domain tests.

---

### Task 1: Database models

**Files:**
- Create: `packages/db/src/models/practitioners.model.ts`
- Create: `packages/db/src/models/appointments.model.ts`
- Modify: `packages/db/src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Practitioner` and `Appointment` mongoose models, exported from `@mediwise-monorepo/db`.

- [ ] **Step 1: Create the practitioner model**

`packages/db/src/models/practitioners.model.ts`:

```ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const practitionerSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		firstName: { type: String },
		lastName: { type: String, required: true },
		// Key from the native specialty list (e.g. "cardiologist", "other").
		specialty: { type: String, required: true },
		// Free text, only meaningful when specialty === "other".
		specialtyOther: { type: String },
		phone: { type: String },
		email: { type: String },
		address: { type: String },
		notes: { type: String },
		// "manual" | "document" — "document" when created from a suggestion.
		source: { type: String, required: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "practitioner" },
);

const Practitioner = model("Practitioner", practitionerSchema);

export { Practitioner };
```

- [ ] **Step 2: Create the appointment model**

`packages/db/src/models/appointments.model.ts`:

```ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, required: true },
		tenantId: { type: String },
		// Null when no practitioner is linked, or after that practitioner was
		// deleted (the name snapshot below is kept).
		practitionerId: { type: String },
		practitionerName: { type: String },
		startAt: { type: Date, required: true },
		reason: { type: String },
		location: { type: String },
		notes: { type: String },
		// Minutes before startAt for the reminder; null = no reminder.
		reminderOffsetMinutes: { type: Number },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date },
	},
	{ collection: "appointment" },
);

const Appointment = model("Appointment", appointmentSchema);

export { Appointment };
```

- [ ] **Step 3: Register both models in the barrel**

In `packages/db/src/index.ts`, add these two imports after the existing `import { Exam } from "./models/exams.model";` line (keep alphabetical order of the import block):

```ts
import { Appointment } from "./models/appointments.model";
import { Practitioner } from "./models/practitioners.model";
```

Then add `Appointment,` and `Practitioner,` to the single `export { ... }` block, keeping it alphabetical: `Account, Appointment, Exam, Job, mongoose, Practitioner, PrescriptionInteractionsView, …`.

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors (turbo may report cached successes for untouched packages).

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/models/practitioners.model.ts packages/db/src/models/appointments.model.ts packages/db/src/index.ts
git commit -m "feat(db): add practitioner and appointment models"
```

---

### Task 2: Practitioners repository

**Files:**
- Create: `packages/infrastructure/src/practitioners/types.ts`
- Create: `packages/infrastructure/src/practitioners/repository.ts`
- Create: `packages/infrastructure/src/practitioners/index.ts`
- Modify: `packages/infrastructure/src/index.ts`
- Modify: `packages/infrastructure/package.json`

**Interfaces:**
- Consumes: `Practitioner`, `Exam`, `PrescriptionUnified` from `@mediwise-monorepo/db` (Task 1).
- Produces:
  - `type PractitionerSource = "manual" | "document"`
  - `type PractitionerDoc` and `type PractitionerFields`
  - `type DocumentDoctorName = { name: string; occurrences: number }`
  - `listPractitionersByUser({ userId, search })` → `Promise<PractitionerDoc[]>`
  - `getPractitionerById({ id, userId })` → `Promise<PractitionerDoc | null>`
  - `createPractitioner({ userId, tenantId, fields, source })` → `Promise<PractitionerDoc>`
  - `updatePractitioner({ id, userId, fields })` → `Promise<PractitionerDoc | null>`
  - `deletePractitioner({ id, userId })` → `Promise<boolean>`
  - `listDoctorNamesFromDocuments({ userId })` → `Promise<DocumentDoctorName[]>`

- [ ] **Step 1: Create the types**

`packages/infrastructure/src/practitioners/types.ts`:

```ts
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
```

- [ ] **Step 2: Create the repository**

`packages/infrastructure/src/practitioners/repository.ts`:

```ts
import { randomUUID } from "node:crypto";

import { Exam, Practitioner, PrescriptionUnified } from "@mediwise-monorepo/db";

import type {
	DocumentDoctorName,
	PractitionerDoc,
	PractitionerFields,
	PractitionerSource,
} from "./types";

export async function listPractitionersByUser(input: {
	userId: string;
	search?: string | null;
}) {
	const filter: Record<string, unknown> = { userId: input.userId };
	const search = input.search?.trim();
	if (search) {
		const rx = new RegExp(escapeRegExp(search), "i");
		filter.$or = [
			{ firstName: rx },
			{ lastName: rx },
			{ specialtyOther: rx },
			{ notes: rx },
		];
	}
	return Practitioner.find(filter)
		.sort({ lastName: 1, firstName: 1 })
		.lean<PractitionerDoc[]>();
}

export async function getPractitionerById(input: {
	id: string;
	userId: string;
}) {
	return Practitioner.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<PractitionerDoc | null>();
}

export async function createPractitioner(input: {
	userId: string;
	tenantId: string | null;
	fields: PractitionerFields;
	source: PractitionerSource;
}) {
	const now = new Date();
	const doc: PractitionerDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		firstName: input.fields.firstName ?? null,
		lastName: input.fields.lastName,
		specialty: input.fields.specialty,
		specialtyOther: input.fields.specialtyOther ?? null,
		phone: input.fields.phone ?? null,
		email: input.fields.email ?? null,
		address: input.fields.address ?? null,
		notes: input.fields.notes ?? null,
		source: input.source,
		createdAt: now,
		updatedAt: now,
	};
	await Practitioner.create(doc);
	return doc;
}

export async function updatePractitioner(input: {
	id: string;
	userId: string;
	fields: PractitionerFields;
}) {
	return Practitioner.findOneAndUpdate(
		{ _id: input.id, userId: input.userId },
		{
			$set: {
				firstName: input.fields.firstName ?? null,
				lastName: input.fields.lastName,
				specialty: input.fields.specialty,
				specialtyOther: input.fields.specialtyOther ?? null,
				phone: input.fields.phone ?? null,
				email: input.fields.email ?? null,
				address: input.fields.address ?? null,
				notes: input.fields.notes ?? null,
				updatedAt: new Date(),
			},
		},
		{ new: true },
	).lean<PractitionerDoc | null>();
}

export async function deletePractitioner(input: {
	id: string;
	userId: string;
}) {
	const res = await Practitioner.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	return res.deletedCount > 0;
}

/**
 * Doctor names already extracted from the user's documents: the `doctor` field
 * of exams and the `prescriberName` of unified prescriptions. Raw display
 * names — normalization and dedup happen in the domain layer.
 */
export async function listDoctorNamesFromDocuments(input: { userId: string }) {
	const counts = new Map<string, DocumentDoctorName>();

	const add = (raw: unknown) => {
		if (typeof raw !== "string") return;
		const name = raw.trim();
		if (!name) return;
		const key = name.toLowerCase();
		const existing = counts.get(key);
		if (existing) {
			existing.occurrences += 1;
			return;
		}
		counts.set(key, { name, occurrences: 1 });
	};

	const exams = await Exam.find({ userId: input.userId })
		.select({ doctor: 1 })
		.lean<{ doctor?: string | null }[]>();
	for (const exam of exams) add(exam.doctor);

	const prescriptions = await PrescriptionUnified.find({ userId: input.userId })
		.select({ data: 1 })
		.lean<{ data?: { prescriberName?: string | null } | null }[]>();
	for (const prescription of prescriptions) {
		add(prescription.data?.prescriberName);
	}

	return [...counts.values()];
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

- [ ] **Step 3: Create the folder barrel and register the package export**

`packages/infrastructure/src/practitioners/index.ts`:

```ts
export * from "./repository";
export * from "./types";
```

In `packages/infrastructure/src/index.ts`, add `export * from "./practitioners";` keeping the list alphabetical (after `./prescriptions`).

In `packages/infrastructure/package.json`, add to `exports`, after the `"./prescriptions/*"` entry:

```json
		"./practitioners": {
			"default": "./src/practitioners/index.ts"
		},
		"./practitioners/*": {
			"default": "./src/practitioners/*.ts"
		},
```

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/infrastructure/src/practitioners packages/infrastructure/src/index.ts packages/infrastructure/package.json
git commit -m "feat(infra): add practitioners repository"
```

---

### Task 3: Appointments repository

**Files:**
- Create: `packages/infrastructure/src/appointments/types.ts`
- Create: `packages/infrastructure/src/appointments/repository.ts`
- Create: `packages/infrastructure/src/appointments/index.ts`
- Modify: `packages/infrastructure/src/index.ts`
- Modify: `packages/infrastructure/package.json`
- Modify: `packages/infrastructure/src/practitioners/repository.ts`

**Interfaces:**
- Consumes: `Appointment` from `@mediwise-monorepo/db` (Task 1); `deletePractitioner` from Task 2.
- Produces:
  - `type AppointmentDoc`, `type AppointmentFields`
  - `listAppointmentsByUser({ userId, practitionerId })` → `Promise<AppointmentDoc[]>` sorted by `startAt` ascending
  - `getAppointmentById({ id, userId })` → `Promise<AppointmentDoc | null>`
  - `createAppointment({ userId, tenantId, fields })` → `Promise<AppointmentDoc>`
  - `updateAppointment({ id, userId, fields })` → `Promise<AppointmentDoc | null>`
  - `deleteAppointment({ id, userId })` → `Promise<boolean>`
  - `detachPractitionerFromAppointments({ practitionerId, userId })` → `Promise<number>`

- [ ] **Step 1: Create the types**

`packages/infrastructure/src/appointments/types.ts`:

```ts
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
```

- [ ] **Step 2: Create the repository**

`packages/infrastructure/src/appointments/repository.ts`:

```ts
import { randomUUID } from "node:crypto";

import { Appointment } from "@mediwise-monorepo/db";

import type { AppointmentDoc, AppointmentFields } from "./types";

export async function listAppointmentsByUser(input: {
	userId: string;
	practitionerId?: string | null;
}) {
	const filter: Record<string, unknown> = { userId: input.userId };
	if (input.practitionerId) filter.practitionerId = input.practitionerId;
	return Appointment.find(filter)
		.sort({ startAt: 1 })
		.lean<AppointmentDoc[]>();
}

export async function getAppointmentById(input: {
	id: string;
	userId: string;
}) {
	return Appointment.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<AppointmentDoc | null>();
}

export async function createAppointment(input: {
	userId: string;
	tenantId: string | null;
	fields: AppointmentFields;
}) {
	const now = new Date();
	const doc: AppointmentDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		practitionerId: input.fields.practitionerId ?? null,
		practitionerName: input.fields.practitionerName ?? null,
		startAt: input.fields.startAt,
		reason: input.fields.reason ?? null,
		location: input.fields.location ?? null,
		notes: input.fields.notes ?? null,
		reminderOffsetMinutes: input.fields.reminderOffsetMinutes ?? null,
		createdAt: now,
		updatedAt: now,
	};
	await Appointment.create(doc);
	return doc;
}

export async function updateAppointment(input: {
	id: string;
	userId: string;
	fields: AppointmentFields;
}) {
	return Appointment.findOneAndUpdate(
		{ _id: input.id, userId: input.userId },
		{
			$set: {
				practitionerId: input.fields.practitionerId ?? null,
				practitionerName: input.fields.practitionerName ?? null,
				startAt: input.fields.startAt,
				reason: input.fields.reason ?? null,
				location: input.fields.location ?? null,
				notes: input.fields.notes ?? null,
				reminderOffsetMinutes: input.fields.reminderOffsetMinutes ?? null,
				updatedAt: new Date(),
			},
		},
		{ new: true },
	).lean<AppointmentDoc | null>();
}

export async function deleteAppointment(input: {
	id: string;
	userId: string;
}) {
	const res = await Appointment.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	return res.deletedCount > 0;
}

/**
 * Unlink a deleted practitioner from their appointments. The denormalized
 * `practitionerName` is kept so the appointment still reads correctly.
 */
export async function detachPractitionerFromAppointments(input: {
	practitionerId: string;
	userId: string;
}) {
	const res = await Appointment.updateMany(
		{ practitionerId: input.practitionerId, userId: input.userId },
		{ $set: { practitionerId: null, updatedAt: new Date() } },
	);
	return res.modifiedCount;
}
```

- [ ] **Step 3: Create the folder barrel and register the package export**

`packages/infrastructure/src/appointments/index.ts`:

```ts
export * from "./repository";
export * from "./types";
```

In `packages/infrastructure/src/index.ts`, add `export * from "./appointments";` as the first line (alphabetical).

In `packages/infrastructure/package.json`, add to `exports`, before `"./exams"`:

```json
		"./appointments": {
			"default": "./src/appointments/index.ts"
		},
		"./appointments/*": {
			"default": "./src/appointments/*.ts"
		},
```

- [ ] **Step 4: Detach appointments when a practitioner is deleted**

In `packages/infrastructure/src/practitioners/repository.ts`, add the import:

```ts
import { detachPractitionerFromAppointments } from "../appointments/repository";
```

and replace the body of `deletePractitioner` with:

```ts
export async function deletePractitioner(input: {
	id: string;
	userId: string;
}) {
	const res = await Practitioner.deleteOne({
		_id: input.id,
		userId: input.userId,
	});
	if (res.deletedCount === 0) return false;
	await detachPractitionerFromAppointments({
		practitionerId: input.id,
		userId: input.userId,
	});
	return true;
}
```

- [ ] **Step 5: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/infrastructure/src/appointments packages/infrastructure/src/practitioners/repository.ts packages/infrastructure/src/index.ts packages/infrastructure/package.json
git commit -m "feat(infra): add appointments repository"
```

---

### Task 4: Domain — practitioner name normalization and suggestions

**Files:**
- Create: `packages/domain/src/practitioners/service.ts`
- Create: `packages/domain/src/practitioners/service.test.ts`
- Create: `packages/domain/src/practitioners/index.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**
- Consumes: nothing (pure functions, no IO).
- Produces, from `@mediwise-monorepo/domain`:
  - `normalizePractitionerName(raw: string): string`
  - `type PractitionerSuggestion = { displayName: string; occurrences: number }`
  - `buildPractitionerSuggestions(input: { documentNames: { name: string; occurrences: number }[]; existingNames: string[] }): PractitionerSuggestion[]`

- [ ] **Step 1: Write the failing tests**

`packages/domain/src/practitioners/service.test.ts`:

```ts
import { describe, expect, it } from "bun:test";

import {
	buildPractitionerSuggestions,
	normalizePractitionerName,
} from "./service";

describe("normalizePractitionerName", () => {
	it("strips titles, collapses spaces and lowercases", () => {
		expect(normalizePractitionerName("Dr. Jane  Doe")).toBe("jane doe");
		expect(normalizePractitionerName("  doctor JANE DOE ")).toBe("jane doe");
		expect(normalizePractitionerName("Pr Jane Doe")).toBe("jane doe");
		expect(normalizePractitionerName("Prof. Jane Doe")).toBe("jane doe");
	});

	it("keeps a name that has no title", () => {
		expect(normalizePractitionerName("Jane Doe")).toBe("jane doe");
	});

	it("returns an empty string for blank input", () => {
		expect(normalizePractitionerName("   ")).toBe("");
		expect(normalizePractitionerName("Dr.")).toBe("");
	});
});

describe("buildPractitionerSuggestions", () => {
	it("drops names already in the directory, whatever the title or case", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Jane Doe", occurrences: 2 },
				{ name: "Dr. John Roe", occurrences: 1 },
			],
			existingNames: ["jane doe"],
		});
		expect(suggestions).toEqual([{ displayName: "Dr. John Roe", occurrences: 1 }]);
	});

	it("merges duplicates and sums their occurrences", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Jane Doe", occurrences: 2 },
				{ name: "jane doe", occurrences: 3 },
			],
			existingNames: [],
		});
		expect(suggestions).toEqual([{ displayName: "Dr. Jane Doe", occurrences: 5 }]);
	});

	it("sorts by occurrences desc then name asc", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "Dr. Zoe Ray", occurrences: 1 },
				{ name: "Dr. Amy Poe", occurrences: 1 },
				{ name: "Dr. Jane Doe", occurrences: 4 },
			],
			existingNames: [],
		});
		expect(suggestions.map((item) => item.displayName)).toEqual([
			"Dr. Jane Doe",
			"Dr. Amy Poe",
			"Dr. Zoe Ray",
		]);
	});

	it("ignores blank and single-character names", () => {
		const suggestions = buildPractitionerSuggestions({
			documentNames: [
				{ name: "   ", occurrences: 1 },
				{ name: "X", occurrences: 1 },
				{ name: "Dr.", occurrences: 1 },
			],
			existingNames: [],
		});
		expect(suggestions).toEqual([]);
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test packages/domain/src/practitioners/service.test.ts`
Expected: FAIL — `Cannot find module './service'`.

- [ ] **Step 3: Write the implementation**

`packages/domain/src/practitioners/service.ts`:

```ts
// Pure practitioner-directory logic: turning the doctor names the extraction
// pipeline found in documents into deduplicated suggestions. No IO here — the
// tRPC service layer passes the names in (see api/routers/practitioners).

/** Leading titles stripped before comparing two names. */
const TITLE_PATTERN = /^(dr|doctor|pr|prof|professor)\.?\s+/i;

/**
 * Comparison key for a practitioner name: no title, single spaces, lowercase.
 * Never displayed — only used to dedup.
 */
export function normalizePractitionerName(raw: string): string {
	let value = raw.trim().replace(/\s+/g, " ");
	// A name may carry more than one title ("Pr Dr Jane Doe").
	while (TITLE_PATTERN.test(value)) {
		value = value.replace(TITLE_PATTERN, "").trim();
	}
	// A bare title ("Dr.") leaves nothing behind.
	if (/^(dr|doctor|pr|prof|professor)\.?$/i.test(value)) return "";
	return value.toLowerCase();
}

export type PractitionerSuggestion = {
	/** The raw name as found in the document, shown to the user. */
	displayName: string;
	occurrences: number;
};

/**
 * Names found in documents minus the ones already in the directory, deduped by
 * normalized name and sorted by how often they appear.
 */
export function buildPractitionerSuggestions(input: {
	documentNames: { name: string; occurrences: number }[];
	existingNames: string[];
}): PractitionerSuggestion[] {
	const taken = new Set(
		input.existingNames
			.map((name) => normalizePractitionerName(name))
			.filter((name) => name.length > 0),
	);

	const merged = new Map<string, PractitionerSuggestion>();
	for (const entry of input.documentNames) {
		const key = normalizePractitionerName(entry.name);
		// Single characters are almost always OCR noise.
		if (key.length < 2 || taken.has(key)) continue;
		const existing = merged.get(key);
		if (existing) {
			existing.occurrences += entry.occurrences;
			continue;
		}
		merged.set(key, {
			displayName: entry.name.trim().replace(/\s+/g, " "),
			occurrences: entry.occurrences,
		});
	}

	return [...merged.values()].sort(
		(a, b) =>
			b.occurrences - a.occurrences || a.displayName.localeCompare(b.displayName),
	);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test packages/domain/src/practitioners/service.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Export from the package**

`packages/domain/src/practitioners/index.ts`:

```ts
export * from "./service";
```

In `packages/domain/src/index.ts`, add `export * from "./practitioners";` keeping the list alphabetical (after `./health-data/service`).

- [ ] **Step 6: Commit**

```bash
git add packages/domain/src/practitioners packages/domain/src/index.ts
git commit -m "feat(domain): practitioner name normalization and suggestions"
```

---

### Task 5: Domain — appointment reminder schedule

**Files:**
- Create: `packages/domain/src/appointments/service.ts`
- Create: `packages/domain/src/appointments/service.test.ts`
- Create: `packages/domain/src/appointments/index.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**
- Consumes: nothing (pure functions, no IO).
- Produces, from `@mediwise-monorepo/domain`:
  - `const DEFAULT_REMINDER_OFFSET_MINUTES = 1440`
  - `type ScheduleAppointment = { id: string; startAt: Date; practitionerName?: string | null; reason?: string | null; location?: string | null; reminderOffsetMinutes?: number | null }`
  - `type AppointmentScheduleEntry = { appointmentId: string; title: string; body: string; triggerAt: string }` (`triggerAt` is an ISO 8601 UTC string)
  - `buildAppointmentSchedule(appointments: ScheduleAppointment[], now: Date): AppointmentScheduleEntry[]`

- [ ] **Step 1: Write the failing tests**

`packages/domain/src/appointments/service.test.ts`:

```ts
import { describe, expect, it } from "bun:test";

import {
	buildAppointmentSchedule,
	DEFAULT_REMINDER_OFFSET_MINUTES,
	type ScheduleAppointment,
} from "./service";

const NOW = new Date("2026-07-19T10:00:00.000Z");

function appointment(
	overrides: Partial<ScheduleAppointment> & { id: string },
): ScheduleAppointment {
	return {
		startAt: new Date("2026-07-25T09:00:00.000Z"),
		practitionerName: "Dr. Jane Doe",
		reason: null,
		location: null,
		reminderOffsetMinutes: DEFAULT_REMINDER_OFFSET_MINUTES,
		...overrides,
	};
}

describe("buildAppointmentSchedule", () => {
	it("subtracts the offset from the start time", () => {
		const [entry] = buildAppointmentSchedule([appointment({ id: "a" })], NOW);
		expect(entry?.appointmentId).toBe("a");
		expect(entry?.triggerAt).toBe("2026-07-24T09:00:00.000Z");
	});

	it("skips appointments with no reminder", () => {
		expect(
			buildAppointmentSchedule(
				[appointment({ id: "a", reminderOffsetMinutes: null })],
				NOW,
			),
		).toEqual([]);
	});

	it("skips triggers already in the past", () => {
		expect(
			buildAppointmentSchedule(
				[
					appointment({
						id: "a",
						startAt: new Date("2026-07-19T10:30:00.000Z"),
						reminderOffsetMinutes: 60,
					}),
				],
				NOW,
			),
		).toEqual([]);
	});

	it("builds the body from practitioner, reason and location", () => {
		const [withAll] = buildAppointmentSchedule(
			[
				appointment({
					id: "a",
					reason: "Annual check-up",
					location: "City Clinic",
				}),
			],
			NOW,
		);
		expect(withAll?.body).toBe("Dr. Jane Doe · Annual check-up · City Clinic");

		const [bare] = buildAppointmentSchedule(
			[appointment({ id: "b", practitionerName: null })],
			NOW,
		);
		expect(bare?.body).toBe("Appointment");
	});

	it("titles the notification with how far ahead the appointment is", () => {
		const [inADay] = buildAppointmentSchedule([appointment({ id: "a" })], NOW);
		expect(inADay?.title).toBe("Appointment tomorrow");

		const [inAnHour] = buildAppointmentSchedule(
			[
				appointment({
					id: "b",
					startAt: new Date("2026-07-20T09:00:00.000Z"),
					reminderOffsetMinutes: 60,
				}),
			],
			NOW,
		);
		expect(inAnHour?.title).toBe("Appointment in 1 hour");

		const [inAWeek] = buildAppointmentSchedule(
			[appointment({ id: "c", reminderOffsetMinutes: 10080 })],
			NOW,
		);
		expect(inAWeek?.title).toBe("Appointment in 1 week");
	});

	it("sorts entries by trigger time", () => {
		const entries = buildAppointmentSchedule(
			[
				appointment({ id: "late", startAt: new Date("2026-08-01T09:00:00.000Z") }),
				appointment({ id: "soon", startAt: new Date("2026-07-21T09:00:00.000Z") }),
			],
			NOW,
		);
		expect(entries.map((entry) => entry.appointmentId)).toEqual(["soon", "late"]);
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test packages/domain/src/appointments/service.test.ts`
Expected: FAIL — `Cannot find module './service'`.

- [ ] **Step 3: Write the implementation**

`packages/domain/src/appointments/service.ts`:

```ts
// Pure appointment logic: turning stored appointments into the flat reminder
// schedule the native client hands straight to expo-notifications. No IO here —
// the tRPC service layer fetches the appointments (see api/routers/appointments).

/** One day before the appointment, the default offered in the form. */
export const DEFAULT_REMINDER_OFFSET_MINUTES = 1440;

export type ScheduleAppointment = {
	id: string;
	startAt: Date;
	practitionerName?: string | null;
	reason?: string | null;
	location?: string | null;
	/** Minutes before startAt; null or undefined = no reminder. */
	reminderOffsetMinutes?: number | null;
};

export type AppointmentScheduleEntry = {
	appointmentId: string;
	title: string;
	body: string;
	/** ISO 8601 UTC instant at which the notification fires. */
	triggerAt: string;
};

function buildTitle(offsetMinutes: number) {
	if (offsetMinutes === 1440) return "Appointment tomorrow";
	if (offsetMinutes % 10080 === 0) {
		const weeks = offsetMinutes / 10080;
		return `Appointment in ${weeks} week${weeks > 1 ? "s" : ""}`;
	}
	if (offsetMinutes % 1440 === 0) {
		const days = offsetMinutes / 1440;
		return `Appointment in ${days} day${days > 1 ? "s" : ""}`;
	}
	if (offsetMinutes % 60 === 0) {
		const hours = offsetMinutes / 60;
		return `Appointment in ${hours} hour${hours > 1 ? "s" : ""}`;
	}
	return `Appointment in ${offsetMinutes} minutes`;
}

function buildBody(appointment: ScheduleAppointment) {
	const parts = [
		appointment.practitionerName,
		appointment.reason,
		appointment.location,
	]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));
	return parts.length ? parts.join(" · ") : "Appointment";
}

/**
 * One notification per appointment that still has a reminder ahead of `now`.
 * Entries whose trigger already passed are dropped rather than scheduled.
 */
export function buildAppointmentSchedule(
	appointments: ScheduleAppointment[],
	now: Date,
): AppointmentScheduleEntry[] {
	const entries: AppointmentScheduleEntry[] = [];
	for (const appointment of appointments) {
		const offset = appointment.reminderOffsetMinutes;
		if (offset === null || offset === undefined) continue;
		const start = appointment.startAt.getTime();
		if (Number.isNaN(start)) continue;
		const trigger = new Date(start - offset * 60_000);
		if (trigger.getTime() <= now.getTime()) continue;
		entries.push({
			appointmentId: appointment.id,
			title: buildTitle(offset),
			body: buildBody(appointment),
			triggerAt: trigger.toISOString(),
		});
	}
	return entries.sort((a, b) => a.triggerAt.localeCompare(b.triggerAt));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test packages/domain/src/appointments/service.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Export from the package**

`packages/domain/src/appointments/index.ts`:

```ts
export * from "./service";
```

In `packages/domain/src/index.ts`, add `export * from "./appointments";` as the first export line (alphabetical).

- [ ] **Step 6: Commit**

```bash
git add packages/domain/src/appointments packages/domain/src/index.ts
git commit -m "feat(domain): appointment reminder schedule"
```

---

### Task 6: Practitioners tRPC router

**Files:**
- Create: `packages/api/src/routers/practitioners/dto/index.ts`
- Create: `packages/api/src/routers/practitioners/services/index.ts`
- Create: `packages/api/src/routers/practitioners/index.ts`
- Modify: `packages/api/src/routers/index.ts`

**Interfaces:**
- Consumes: the practitioners repository (Task 2), `buildPractitionerSuggestions` (Task 4).
- Produces: `practitionersRouter` mounted as `practitioners` on `appRouter`, with procedures:
  - `list({ search?: string | null })` → `{ id, firstName, lastName, specialty, specialtyOther, phone, email, address, notes, source }[]`
  - `get({ id })` → the same shape plus `createdAt`, `updatedAt`
  - `save({ id?, firstName?, lastName, specialty, specialtyOther?, phone?, email?, address?, notes?, source? })` → `{ id }`
  - `delete({ id })` → `{ id, deleted: true }`
  - `suggestions()` → `{ displayName: string; occurrences: number }[]`

- [ ] **Step 1: Write the input schemas**

`packages/api/src/routers/practitioners/dto/index.ts`:

```ts
import { z } from "zod";

export const practitionerFieldsInput = z
	.object({
		firstName: z.string().optional().nullable(),
		lastName: z.string().min(1),
		specialty: z.string().min(1),
		specialtyOther: z.string().optional().nullable(),
		phone: z.string().optional().nullable(),
		email: z.string().optional().nullable(),
		address: z.string().optional().nullable(),
		notes: z.string().optional().nullable(),
	})
	.refine(
		(value) =>
			value.specialty !== "other" || Boolean(value.specialtyOther?.trim()),
		{
			message: "Describe the specialty.",
			path: ["specialtyOther"],
		},
	);

export const practitionerSaveInput = z.object({
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
});

export const practitionerListInput = z.object({
	search: z.string().optional().nullable(),
});

export const practitionerIdInput = z.object({
	id: z.string().min(1),
});
```

Note: `practitionerFieldsInput` is the shared shape used for typing; `practitionerSaveInput` repeats the fields because a zod `.refine()` result cannot be `.extend()`ed. The same `specialtyOther` rule is enforced in the service layer (Step 2).

- [ ] **Step 2: Write the service layer**

`packages/api/src/routers/practitioners/services/index.ts`:

```ts
import { buildPractitionerSuggestions } from "@mediwise-monorepo/domain";
import {
	createPractitioner,
	deletePractitioner as deletePractitionerRepo,
	getPractitionerById,
	listDoctorNamesFromDocuments,
	listPractitionersByUser,
	updatePractitioner,
} from "@mediwise-monorepo/infrastructure/practitioners";
import type {
	PractitionerDoc,
	PractitionerFields,
	PractitionerSource,
} from "@mediwise-monorepo/infrastructure/practitioners";
import { TRPCError } from "@trpc/server";

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

function resolveTenantId(user: SessionUser) {
	return user.tenantId ?? null;
}

function toDto(practitioner: PractitionerDoc) {
	return {
		id: practitioner._id,
		firstName: practitioner.firstName ?? null,
		lastName: practitioner.lastName,
		specialty: practitioner.specialty,
		specialtyOther: practitioner.specialtyOther ?? null,
		phone: practitioner.phone ?? null,
		email: practitioner.email ?? null,
		address: practitioner.address ?? null,
		notes: practitioner.notes ?? null,
		source: practitioner.source,
	};
}

export async function listPractitioners(params: {
	userId: string;
	search?: string | null;
}) {
	const practitioners = await listPractitionersByUser({
		userId: params.userId,
		search: params.search,
	});
	return practitioners.map(toDto);
}

export async function getPractitioner(params: { userId: string; id: string }) {
	const practitioner = await getPractitionerById({
		id: params.id,
		userId: params.userId,
	});
	if (!practitioner) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Practitioner not found.",
		});
	}
	return {
		...toDto(practitioner),
		createdAt: practitioner.createdAt,
		updatedAt: practitioner.updatedAt ?? null,
	};
}

export async function savePractitioner(params: {
	user: SessionUser;
	input: {
		id?: string | null;
		firstName?: string | null;
		lastName: string;
		specialty: string;
		specialtyOther?: string | null;
		phone?: string | null;
		email?: string | null;
		address?: string | null;
		notes?: string | null;
		source?: PractitionerSource | null;
	};
}) {
	if (
		params.input.specialty === "other" &&
		!params.input.specialtyOther?.trim()
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Describe the specialty.",
		});
	}

	const fields: PractitionerFields = {
		firstName: params.input.firstName?.trim() || null,
		lastName: params.input.lastName.trim(),
		specialty: params.input.specialty,
		specialtyOther: params.input.specialtyOther?.trim() || null,
		phone: params.input.phone?.trim() || null,
		email: params.input.email?.trim() || null,
		address: params.input.address?.trim() || null,
		notes: params.input.notes?.trim() || null,
	};

	if (params.input.id) {
		const updated = await updatePractitioner({
			id: params.input.id,
			userId: params.user.id,
			fields,
		});
		if (!updated) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Practitioner not found.",
			});
		}
		return { id: updated._id };
	}

	const created = await createPractitioner({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		fields,
		source: params.input.source ?? "manual",
	});
	return { id: created._id };
}

export async function deletePractitioner(params: {
	userId: string;
	id: string;
}) {
	const deleted = await deletePractitionerRepo({
		id: params.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Practitioner not found.",
		});
	}
	return { id: params.id, deleted: true };
}

/**
 * Doctor names found in the user's documents that are not in the directory yet.
 */
export async function listPractitionerSuggestions(params: { userId: string }) {
	const [documentNames, practitioners] = await Promise.all([
		listDoctorNamesFromDocuments({ userId: params.userId }),
		listPractitionersByUser({ userId: params.userId }),
	]);
	return buildPractitionerSuggestions({
		documentNames,
		existingNames: practitioners.map((practitioner) =>
			[practitioner.firstName, practitioner.lastName]
				.filter(Boolean)
				.join(" "),
		),
	});
}
```

- [ ] **Step 3: Write the router and register it**

`packages/api/src/routers/practitioners/index.ts`:

```ts
import { protectedProcedure, router } from "../../index";
import {
	practitionerIdInput,
	practitionerListInput,
	practitionerSaveInput,
} from "./dto";
import {
	deletePractitioner,
	getPractitioner,
	listPractitioners,
	listPractitionerSuggestions,
	savePractitioner,
} from "./services";

export const practitionersRouter = router({
	list: protectedProcedure
		.input(practitionerListInput.optional())
		.query(async ({ ctx, input }) => {
			return listPractitioners({
				userId: ctx.session.user.id,
				search: input?.search ?? null,
			});
		}),
	get: protectedProcedure
		.input(practitionerIdInput)
		.query(async ({ ctx, input }) => {
			return getPractitioner({ userId: ctx.session.user.id, id: input.id });
		}),
	suggestions: protectedProcedure.query(async ({ ctx }) => {
		return listPractitionerSuggestions({ userId: ctx.session.user.id });
	}),
	save: protectedProcedure
		.input(practitionerSaveInput)
		.mutation(async ({ ctx, input }) => {
			return savePractitioner({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(practitionerIdInput)
		.mutation(async ({ ctx, input }) => {
			return deletePractitioner({ userId: ctx.session.user.id, id: input.id });
		}),
});
```

In `packages/api/src/routers/index.ts`: add `import { practitionersRouter } from "./practitioners";` with the other router imports (alphabetical) and `practitioners: practitionersRouter,` inside `appRouter` after `exams`.

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/routers/practitioners packages/api/src/routers/index.ts
git commit -m "feat(api): practitioners router"
```

---

### Task 7: Appointments tRPC router

**Files:**
- Create: `packages/api/src/routers/appointments/dto/index.ts`
- Create: `packages/api/src/routers/appointments/services/index.ts`
- Create: `packages/api/src/routers/appointments/index.ts`
- Modify: `packages/api/src/routers/index.ts`

**Interfaces:**
- Consumes: the appointments repository (Task 3), `getPractitionerById` (Task 2), `buildAppointmentSchedule` (Task 5).
- Produces: `appointmentsRouter` mounted as `appointments`, with procedures:
  - `list({ practitionerId?: string | null })` → `{ id, practitionerId, practitionerName, startAt: Date, reason, location, notes, reminderOffsetMinutes }[]` sorted ascending
  - `get({ id })` → the same shape for one appointment
  - `save({ id?, practitionerId?, startAt: string, reason?, location?, notes?, reminderOffsetMinutes? })` → `{ id }`; `startAt` is an ISO 8601 string
  - `delete({ id })` → `{ id, deleted: true }`
  - `schedule()` → `AppointmentScheduleEntry[]` (see Task 5)

- [ ] **Step 1: Write the input schemas**

`packages/api/src/routers/appointments/dto/index.ts`:

```ts
import { z } from "zod";

export const appointmentSaveInput = z.object({
	id: z.string().optional().nullable(),
	practitionerId: z.string().optional().nullable(),
	// ISO 8601 instant, e.g. "2026-08-12T09:30:00.000Z".
	startAt: z.string().min(1),
	reason: z.string().optional().nullable(),
	location: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
	reminderOffsetMinutes: z.number().int().positive().optional().nullable(),
});

export const appointmentListInput = z.object({
	practitionerId: z.string().optional().nullable(),
});

export const appointmentIdInput = z.object({
	id: z.string().min(1),
});
```

- [ ] **Step 2: Write the service layer**

`packages/api/src/routers/appointments/services/index.ts`:

```ts
import { buildAppointmentSchedule } from "@mediwise-monorepo/domain";
import {
	createAppointment,
	deleteAppointment as deleteAppointmentRepo,
	getAppointmentById,
	listAppointmentsByUser,
	updateAppointment,
} from "@mediwise-monorepo/infrastructure/appointments";
import type {
	AppointmentDoc,
	AppointmentFields,
} from "@mediwise-monorepo/infrastructure/appointments";
import { getPractitionerById } from "@mediwise-monorepo/infrastructure/practitioners";
import { TRPCError } from "@trpc/server";

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

function resolveTenantId(user: SessionUser) {
	return user.tenantId ?? null;
}

function toDto(appointment: AppointmentDoc) {
	return {
		id: appointment._id,
		practitionerId: appointment.practitionerId ?? null,
		practitionerName: appointment.practitionerName ?? null,
		startAt: appointment.startAt,
		reason: appointment.reason ?? null,
		location: appointment.location ?? null,
		notes: appointment.notes ?? null,
		reminderOffsetMinutes: appointment.reminderOffsetMinutes ?? null,
	};
}

export async function listAppointments(params: {
	userId: string;
	practitionerId?: string | null;
}) {
	const appointments = await listAppointmentsByUser({
		userId: params.userId,
		practitionerId: params.practitionerId,
	});
	return appointments.map(toDto);
}

export async function getAppointment(params: { userId: string; id: string }) {
	const appointment = await getAppointmentById({
		id: params.id,
		userId: params.userId,
	});
	if (!appointment) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Appointment not found.",
		});
	}
	return toDto(appointment);
}

export async function saveAppointment(params: {
	user: SessionUser;
	input: {
		id?: string | null;
		practitionerId?: string | null;
		startAt: string;
		reason?: string | null;
		location?: string | null;
		notes?: string | null;
		reminderOffsetMinutes?: number | null;
	};
}) {
	const startAt = new Date(params.input.startAt);
	if (Number.isNaN(startAt.getTime())) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid appointment date.",
		});
	}

	// Snapshot the practitioner name so the appointment still reads correctly
	// after that practitioner is deleted.
	let practitionerName: string | null = null;
	if (params.input.practitionerId) {
		const practitioner = await getPractitionerById({
			id: params.input.practitionerId,
			userId: params.user.id,
		});
		if (!practitioner) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Practitioner not found.",
			});
		}
		practitionerName = [practitioner.firstName, practitioner.lastName]
			.filter(Boolean)
			.join(" ");
	}

	const fields: AppointmentFields = {
		practitionerId: params.input.practitionerId ?? null,
		practitionerName,
		startAt,
		reason: params.input.reason?.trim() || null,
		location: params.input.location?.trim() || null,
		notes: params.input.notes?.trim() || null,
		reminderOffsetMinutes: params.input.reminderOffsetMinutes ?? null,
	};

	if (params.input.id) {
		const updated = await updateAppointment({
			id: params.input.id,
			userId: params.user.id,
			fields,
		});
		if (!updated) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Appointment not found.",
			});
		}
		return { id: updated._id };
	}

	const created = await createAppointment({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		fields,
	});
	return { id: created._id };
}

export async function deleteAppointment(params: {
	userId: string;
	id: string;
}) {
	const deleted = await deleteAppointmentRepo({
		id: params.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Appointment not found.",
		});
	}
	return { id: params.id, deleted: true };
}

/** Flat notification schedule the native client schedules verbatim. */
export async function getAppointmentSchedule(params: { userId: string }) {
	const appointments = await listAppointmentsByUser({ userId: params.userId });
	return buildAppointmentSchedule(
		appointments.map((appointment) => ({
			id: appointment._id,
			startAt: appointment.startAt,
			practitionerName: appointment.practitionerName ?? null,
			reason: appointment.reason ?? null,
			location: appointment.location ?? null,
			reminderOffsetMinutes: appointment.reminderOffsetMinutes ?? null,
		})),
		new Date(),
	);
}
```

- [ ] **Step 3: Write the router and register it**

`packages/api/src/routers/appointments/index.ts`:

```ts
import { protectedProcedure, router } from "../../index";
import {
	appointmentIdInput,
	appointmentListInput,
	appointmentSaveInput,
} from "./dto";
import {
	deleteAppointment,
	getAppointment,
	getAppointmentSchedule,
	listAppointments,
	saveAppointment,
} from "./services";

export const appointmentsRouter = router({
	list: protectedProcedure
		.input(appointmentListInput.optional())
		.query(async ({ ctx, input }) => {
			return listAppointments({
				userId: ctx.session.user.id,
				practitionerId: input?.practitionerId ?? null,
			});
		}),
	get: protectedProcedure
		.input(appointmentIdInput)
		.query(async ({ ctx, input }) => {
			return getAppointment({ userId: ctx.session.user.id, id: input.id });
		}),
	schedule: protectedProcedure.query(async ({ ctx }) => {
		return getAppointmentSchedule({ userId: ctx.session.user.id });
	}),
	save: protectedProcedure
		.input(appointmentSaveInput)
		.mutation(async ({ ctx, input }) => {
			return saveAppointment({ user: ctx.session.user, input });
		}),
	delete: protectedProcedure
		.input(appointmentIdInput)
		.mutation(async ({ ctx, input }) => {
			return deleteAppointment({ userId: ctx.session.user.id, id: input.id });
		}),
});
```

In `packages/api/src/routers/index.ts`: add `import { appointmentsRouter } from "./appointments";` (alphabetically first of the feature imports) and `appointments: appointmentsRouter,` inside `appRouter`.

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/routers/appointments packages/api/src/routers/index.ts
git commit -m "feat(api): appointments router"
```

---

### Task 8: Native shared inputs — specialty list, options picker, date-time picker

**Files:**
- Create: `apps/native/features/practitioners/specialties.ts`
- Create: `apps/native/components/base/options-picker/options-picker.tsx`
- Create: `apps/native/components/base/options-picker/index.ts`
- Create: `apps/native/components/base/date-time-picker/date-time-picker.tsx`
- Create: `apps/native/components/base/date-time-picker/index.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `SPECIALTIES: { key: string; label: string }[]` and `specialtyLabel(key: string, other?: string | null): string` from `@/features/practitioners/specialties`
  - `<OptionsPicker label value onChange options placeholder helperText />` where `options: { value: string; label: string }[]`, `value: string | null`, `onChange: (next: string) => void`
  - `<DateTimePickerField label value onChange />` where `value: string | null` is an ISO instant and `onChange: (next: string) => void` returns an ISO instant

- [ ] **Step 1: Create the specialty list**

`apps/native/features/practitioners/specialties.ts`:

```ts
/**
 * Practitioner specialties offered by the directory form. Keys are stored in
 * the database; labels are display-only. "other" unlocks a free-text field.
 */
export const SPECIALTIES = [
	{ key: "general_practitioner", label: "General practitioner" },
	{ key: "pediatrician", label: "Pediatrician" },
	{ key: "cardiologist", label: "Cardiologist" },
	{ key: "dermatologist", label: "Dermatologist" },
	{ key: "dentist", label: "Dentist" },
	{ key: "ophthalmologist", label: "Ophthalmologist" },
	{ key: "gynecologist", label: "Gynecologist" },
	{ key: "endocrinologist", label: "Endocrinologist" },
	{ key: "gastroenterologist", label: "Gastroenterologist" },
	{ key: "neurologist", label: "Neurologist" },
	{ key: "oncologist", label: "Oncologist" },
	{ key: "orthopedist", label: "Orthopedist" },
	{ key: "psychiatrist", label: "Psychiatrist" },
	{ key: "psychologist", label: "Psychologist" },
	{ key: "pulmonologist", label: "Pulmonologist" },
	{ key: "rheumatologist", label: "Rheumatologist" },
	{ key: "urologist", label: "Urologist" },
	{ key: "physiotherapist", label: "Physiotherapist" },
	{ key: "nurse", label: "Nurse" },
	{ key: "midwife", label: "Midwife" },
	{ key: "pharmacist", label: "Pharmacist" },
	{ key: "dietitian", label: "Dietitian" },
	{ key: "other", label: "Other" },
] as const;

export const SPECIALTY_OPTIONS = SPECIALTIES.map((specialty) => ({
	value: specialty.key,
	label: specialty.label,
}));

/** Display label for a stored specialty key, falling back to the free text. */
export function specialtyLabel(key: string, other?: string | null) {
	if (key === "other") return other?.trim() || "Other";
	return (
		SPECIALTIES.find((specialty) => specialty.key === key)?.label ?? "Other"
	);
}
```

- [ ] **Step 2: Create the options picker**

`apps/native/components/base/options-picker/options-picker.tsx`:

```ts
import { Ionicons } from "@expo/vector-icons";
import { Button, cn, Input, Label, TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { pressableFeedback } from "@/components/utils";

export type PickerOption = {
	value: string;
	label: string;
};

type OptionsPickerProps = {
	options: PickerOption[];
	value: string | null;
	onChange: (next: string) => void;
	label?: string;
	helperText?: string;
	placeholder?: string;
	title?: string;
};

/**
 * Single-choice picker opening a bottom sheet. Used for long option lists where
 * inline radio buttons would not fit (specialties, practitioners).
 */
export function OptionsPicker({
	options,
	value,
	onChange,
	label,
	helperText,
	placeholder = "Select",
	title,
}: OptionsPickerProps) {
	const [open, setOpen] = React.useState(false);
	const accent = useThemeColor("accent");
	const selected = options.find((option) => option.value === value);

	const handleSelect = (next: string) => {
		onChange(next);
		setOpen(false);
	};

	return (
		<View>
			<Pressable onPress={() => setOpen(true)}>
				<TextField>
					{label ? <Label>{label}</Label> : null}
					<Input
						value={selected?.label ?? ""}
						placeholder={placeholder}
						editable={false}
						pointerEvents="none"
					/>
				</TextField>
				{helperText ? (
					<Text className="text-muted mt-1 text-xs">{helperText}</Text>
				) : null}
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/40"
					onPress={() => setOpen(false)}
				>
					<Pressable className="bg-background max-h-[70%] rounded-t-3xl px-6 pt-5 pb-8">
						<View className="gap-4">
							<Text className="text-foreground text-lg font-semibold">
								{title ?? label ?? "Select"}
							</Text>
							<ScrollView className="max-h-80">
								<View className="gap-2">
									{options.map((option) => {
										const isSelected = option.value === value;
										return (
											<Pressable
												key={option.value}
												onPress={() => handleSelect(option.value)}
												className={cn(
													"border-panel-border bg-panel-background flex-row items-center justify-between rounded-2xl border px-4 py-3",
													isSelected && "border-primary bg-primary/10",
												)}
												style={pressableFeedback()}
												accessibilityRole="radio"
												accessibilityState={{ selected: isSelected }}
											>
												<Text
													className={cn(
														"text-muted text-sm",
														isSelected && "text-primary font-semibold",
													)}
												>
													{option.label}
												</Text>
												{isSelected ? (
													<Ionicons
														name="checkmark"
														size={16}
														color={accent}
													/>
												) : null}
											</Pressable>
										);
									})}
								</View>
							</ScrollView>
							<Button variant="secondary" onPress={() => setOpen(false)}>
								<Button.Label>Cancel</Button.Label>
							</Button>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
```

`apps/native/components/base/options-picker/index.ts`:

```ts
export * from "./options-picker";
```

- [ ] **Step 3: Create the date-time picker**

`apps/native/components/base/date-time-picker/date-time-picker.tsx`:

```ts
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Input, Label, TextField, useThemeColor } from "heroui-native";
import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type DateTimePickerFieldProps = {
	/** ISO 8601 instant, or null when nothing has been picked yet. */
	value: string | null;
	onChange: (nextValue: string) => void;
	label?: string;
	helperText?: string;
};

function formatValue(value: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function nextDefaultDate() {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	date.setHours(9, 0, 0, 0);
	return date;
}

/**
 * Date + time field returning an ISO instant. Opens one bottom sheet with a
 * date spinner and a time spinner, mirroring the base DatePicker.
 */
export function DateTimePickerField({
	value,
	onChange,
	label,
	helperText,
}: DateTimePickerFieldProps) {
	const foreground = useThemeColor("foreground");
	const accentColor = useThemeColor("muted");
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<Date>(() => {
		const parsed = value ? new Date(value) : null;
		return parsed && !Number.isNaN(parsed.getTime())
			? parsed
			: nextDefaultDate();
	});

	React.useEffect(() => {
		if (!open) return;
		const parsed = value ? new Date(value) : null;
		setDraft(
			parsed && !Number.isNaN(parsed.getTime()) ? parsed : nextDefaultDate(),
		);
	}, [open, value]);

	const handleChangeDate = (selected?: Date) => {
		if (!selected) return;
		setDraft((current) => {
			const next = new Date(current);
			next.setFullYear(
				selected.getFullYear(),
				selected.getMonth(),
				selected.getDate(),
			);
			return next;
		});
	};

	const handleChangeTime = (selected?: Date) => {
		if (!selected) return;
		setDraft((current) => {
			const next = new Date(current);
			next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
			return next;
		});
	};

	return (
		<View>
			<Pressable onPress={() => setOpen(true)}>
				<TextField>
					{label ? <Label>{label}</Label> : null}
					<Input
						value={formatValue(value)}
						placeholder="Select date and time"
						editable={false}
						pointerEvents="none"
					/>
				</TextField>
				{helperText ? (
					<Text className="text-muted mt-1 text-xs">{helperText}</Text>
				) : null}
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/40"
					onPress={() => setOpen(false)}
				>
					<Pressable className="bg-background rounded-t-3xl px-6 pt-5 pb-8">
						<View className="gap-4">
							<Text className="text-foreground text-lg font-semibold">
								{label ?? "Select date and time"}
							</Text>
							<DateTimePicker
								mode="date"
								display="spinner"
								value={draft}
								onChange={(_, selected) => handleChangeDate(selected)}
								textColor={foreground}
								accentColor={accentColor}
							/>
							<DateTimePicker
								mode="time"
								display="spinner"
								value={draft}
								onChange={(_, selected) => handleChangeTime(selected)}
								textColor={foreground}
								accentColor={accentColor}
							/>
							<View className="flex-row gap-2">
								<Button
									variant="secondary"
									className="flex-1"
									onPress={() => setOpen(false)}
								>
									<Button.Label>Cancel</Button.Label>
								</Button>
								<Button
									className="flex-1"
									onPress={() => {
										onChange(draft.toISOString());
										setOpen(false);
									}}
								>
									<Button.Label>Save</Button.Label>
								</Button>
							</View>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
```

`apps/native/components/base/date-time-picker/index.ts`:

```ts
export * from "./date-time-picker";
```

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/native/features/practitioners apps/native/components/base/options-picker apps/native/components/base/date-time-picker
git commit -m "feat(native): specialty list, options picker and date-time picker"
```

---

### Task 9: Practitioner form and create screen

**Files:**
- Create: `apps/native/components/features/practitioner/practitioner-form/practitioner-form.tsx`
- Create: `apps/native/components/features/practitioner/practitioner-form/index.ts`
- Create: `apps/native/app/practitioners/new.tsx`
- Modify: `apps/native/app/practitioners/_layout.tsx`

**Interfaces:**
- Consumes: `SPECIALTY_OPTIONS` (Task 8), `OptionsPicker` (Task 8), `trpc.practitioners.save` (Task 6).
- Produces:
  - `type PractitionerFormValues = { firstName: string | null; lastName: string; specialty: string; specialtyOther: string | null; phone: string | null; email: string | null; address: string | null; notes: string | null }`
  - `<PractitionerForm initial onSubmit isSaving submitLabel error onDelete isDeleting />`

- [ ] **Step 1: Write the form component**

`apps/native/components/features/practitioner/practitioner-form/practitioner-form.tsx`:

```ts
import { Button, Input, Label, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { OptionsPicker } from "@/components/base/options-picker";
import { Caption } from "@/components/base/typography";
import { SPECIALTY_OPTIONS } from "@/features/practitioners/specialties";

export type PractitionerFormValues = {
	firstName: string | null;
	lastName: string;
	specialty: string;
	specialtyOther: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
};

type PractitionerFormProps = {
	initial?: Partial<PractitionerFormValues>;
	onSubmit: (values: PractitionerFormValues) => void;
	isSaving?: boolean;
	submitLabel?: string;
	error?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function PractitionerForm({
	initial,
	onSubmit,
	isSaving,
	submitLabel = "Save",
	error,
	onDelete,
	isDeleting,
}: PractitionerFormProps) {
	const [firstName, setFirstName] = useState(initial?.firstName ?? "");
	const [lastName, setLastName] = useState(initial?.lastName ?? "");
	const [specialty, setSpecialty] = useState(
		initial?.specialty ?? "general_practitioner",
	);
	const [specialtyOther, setSpecialtyOther] = useState(
		initial?.specialtyOther ?? "",
	);
	const [phone, setPhone] = useState(initial?.phone ?? "");
	const [email, setEmail] = useState(initial?.email ?? "");
	const [address, setAddress] = useState(initial?.address ?? "");
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = () => {
		if (!lastName.trim()) {
			setLocalError("Last name is required.");
			return;
		}
		if (specialty === "other" && !specialtyOther.trim()) {
			setLocalError("Describe the specialty.");
			return;
		}
		setLocalError(null);
		onSubmit({
			firstName: firstName.trim() || null,
			lastName: lastName.trim(),
			specialty,
			specialtyOther: specialty === "other" ? specialtyOther.trim() : null,
			phone: phone.trim() || null,
			email: email.trim() || null,
			address: address.trim() || null,
			notes: notes.trim() || null,
		});
	};

	return (
		<View className="gap-4">
			<TextField>
				<Label>Last name</Label>
				<Input value={lastName} onChangeText={setLastName} placeholder="Doe" />
			</TextField>

			<TextField>
				<Label>First name</Label>
				<Input
					value={firstName}
					onChangeText={setFirstName}
					placeholder="Jane"
				/>
			</TextField>

			<OptionsPicker
				label="Specialty"
				title="Select a specialty"
				options={SPECIALTY_OPTIONS}
				value={specialty}
				onChange={setSpecialty}
			/>

			{specialty === "other" ? (
				<TextField>
					<Label>Specialty name</Label>
					<Input
						value={specialtyOther}
						onChangeText={setSpecialtyOther}
						placeholder="Osteopath, speech therapist…"
					/>
				</TextField>
			) : null}

			<TextField>
				<Label>Phone</Label>
				<Input
					value={phone}
					onChangeText={setPhone}
					placeholder="+1 555 010 2030"
					keyboardType="phone-pad"
				/>
			</TextField>

			<TextField>
				<Label>Email</Label>
				<Input
					value={email}
					onChangeText={setEmail}
					placeholder="jane.doe@clinic.com"
					keyboardType="email-address"
					autoCapitalize="none"
				/>
			</TextField>

			<TextField>
				<Label>Address</Label>
				<Input
					value={address}
					onChangeText={setAddress}
					placeholder="12 Main Street, Springfield"
					multiline
				/>
			</TextField>

			<TextField>
				<Label>Notes</Label>
				<Input
					value={notes}
					onChangeText={setNotes}
					placeholder="Parking at the back, speaks Spanish…"
					multiline
				/>
			</TextField>

			{error || localError ? (
				<Caption className="text-danger">{error ?? localError}</Caption>
			) : null}

			<Button onPress={handleSubmit} isDisabled={isSaving} className="mt-2">
				{isSaving ? (
					<Spinner size="sm" color="default" />
				) : (
					<Button.Label>{submitLabel}</Button.Label>
				)}
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Deleting…" : "Delete practitioner"}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
```

`apps/native/components/features/practitioner/practitioner-form/index.ts`:

```ts
export * from "./practitioner-form";
```

- [ ] **Step 2: Write the create screen**

`apps/native/app/practitioners/new.tsx`:

```ts
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
	PractitionerForm,
	type PractitionerFormValues,
} from "@/components/features/practitioner/practitioner-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function NewPractitionerScreen() {
	// Prefilled when the user taps a suggestion found in their documents.
	const params = useLocalSearchParams<{ name?: string }>();
	const suggestedName = params.name ? decodeURIComponent(params.name) : "";
	const [error, setError] = useState<string | null>(null);

	const saveMutation = useMutation(
		trpc.practitioners.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the practitioner.");
			},
		}),
	);

	const handleSubmit = (values: PractitionerFormValues) => {
		setError(null);
		saveMutation.mutate({
			...values,
			source: suggestedName ? "document" : "manual",
		});
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<PractitionerForm
				initial={splitSuggestedName(suggestedName)}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Add practitioner"
				error={error}
			/>
		</Container>
	);
}

/**
 * Documents give one full name ("Dr. Jane Doe"): drop the title, use the last
 * word as the last name and whatever precedes it as the first name.
 */
function splitSuggestedName(raw: string) {
	const cleaned = raw
		.replace(/^(dr|doctor|pr|prof|professor)\.?\s+/i, "")
		.trim();
	if (!cleaned) return undefined;
	const parts = cleaned.split(/\s+/);
	const lastName = parts.pop() ?? cleaned;
	return {
		firstName: parts.join(" ") || null,
		lastName,
	};
}
```

- [ ] **Step 3: Register the new screens in the layout**

Replace `apps/native/app/practitioners/_layout.tsx` with:

```ts
import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function PractitionersLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Practitioners",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "New practitioner",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Practitioner",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
```

The `[id]` screen file arrives in Task 11; expo-router tolerates a declared screen whose file does not exist yet, but if the dev server warns, finish Task 11 before running the app.

- [ ] **Step 4: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/native/components/features/practitioner apps/native/app/practitioners
git commit -m "feat(native): practitioner form and create screen"
```

---

### Task 10: Practitioners list screen with document suggestions

**Files:**
- Create: `apps/native/features/practitioners/utils.ts`
- Modify: `apps/native/app/practitioners/index.tsx`

**Interfaces:**
- Consumes: `trpc.practitioners.list`, `trpc.practitioners.suggestions` (Task 6), `SPECIALTIES` / `specialtyLabel` (Task 8).
- Produces, from `@/features/practitioners/utils`:
  - `type PractitionerListItem = { id: string; firstName: string | null; lastName: string; specialty: string; specialtyOther: string | null; phone: string | null; email: string | null; address: string | null; notes: string | null; source: string }`
  - `formatPractitionerName(item: { firstName: string | null; lastName: string }): string`
  - `groupBySpecialty(items: PractitionerListItem[]): { key: string; label: string; items: PractitionerListItem[] }[]`

- [ ] **Step 1: Write the list helpers**

`apps/native/features/practitioners/utils.ts`:

```ts
import { SPECIALTIES, specialtyLabel } from "./specialties";

export type PractitionerListItem = {
	id: string;
	firstName: string | null;
	lastName: string;
	specialty: string;
	specialtyOther: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
	source: string;
};

export function formatPractitionerName(item: {
	firstName: string | null;
	lastName: string;
}) {
	return [item.firstName, item.lastName].filter(Boolean).join(" ");
}

/**
 * Group practitioners into specialty sections, in the order of the specialty
 * list ("Other" last). Free-text specialties get one section per label.
 */
export function groupBySpecialty(items: PractitionerListItem[]) {
	const groups: {
		key: string;
		label: string;
		items: PractitionerListItem[];
	}[] = [];
	const index = new Map<string, number>();

	for (const item of items) {
		const label = specialtyLabel(item.specialty, item.specialtyOther);
		const key = item.specialty === "other" ? `other:${label}` : item.specialty;
		if (!index.has(key)) {
			index.set(key, groups.length);
			groups.push({ key, label, items: [] });
		}
		const position = index.get(key);
		if (position !== undefined) groups[position]?.items.push(item);
	}

	const order = new Map(
		SPECIALTIES.map((specialty, position) => [specialty.key, position]),
	);
	return groups.sort((a, b) => {
		const rankA = order.get(a.key) ?? Number.MAX_SAFE_INTEGER;
		const rankB = order.get(b.key) ?? Number.MAX_SAFE_INTEGER;
		return rankA - rankB || a.label.localeCompare(b.label);
	});
}
```

- [ ] **Step 2: Write the list screen**

Replace `apps/native/app/practitioners/index.tsx` with:

```ts
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { Input, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { specialtyLabel } from "@/features/practitioners/specialties";
import {
	formatPractitionerName,
	groupBySpecialty,
	type PractitionerListItem,
} from "@/features/practitioners/utils";
import { trpc } from "@/utils/trpc";

type Suggestion = {
	displayName: string;
	occurrences: number;
};

export default function PractitionersScreen() {
	const accent = useThemeColor("accent");
	const [search, setSearch] = useState("");

	const practitionersQuery = useQuery({
		...trpc.practitioners.list.queryOptions({ search: search.trim() || null }),
	});
	const suggestionsQuery = useQuery({
		...trpc.practitioners.suggestions.queryOptions(),
	});

	const practitioners = (practitionersQuery.data ??
		[]) as PractitionerListItem[];
	const groups = groupBySpecialty(practitioners);
	const suggestions = (suggestionsQuery.data ?? []) as Suggestion[];

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/practitioners/new")}
							className="h-9 w-9 items-center justify-center rounded-full"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add a practitioner"
						>
							<Ionicons name="add" size={22} color={accent} />
						</Pressable>
					),
				}}
			/>

			<View className="mb-4">
				<Input
					value={search}
					onChangeText={setSearch}
					placeholder="Search (name, specialty, notes)"
				/>
			</View>

			<VerticalStack className="gap-6">
				{suggestions.length ? (
					<View className="gap-3">
						<Caption>Found in your documents</Caption>
						<VerticalStack className="gap-3">
							{suggestions.map((suggestion) => (
								<Card key={suggestion.displayName} variant="outline">
									<CardBody className="flex-row items-center justify-between gap-3">
										<View className="flex-1">
											<BodyStrong>{suggestion.displayName}</BodyStrong>
											<Body className="text-muted">
												{suggestion.occurrences === 1
													? "1 document"
													: `${suggestion.occurrences} documents`}
											</Body>
										</View>
										<Pressable
											onPress={() =>
												router.push(
													`/practitioners/new?name=${encodeURIComponent(
														suggestion.displayName,
													)}`,
												)
											}
											className="border-panel-border h-9 w-9 items-center justify-center rounded-full border"
											style={pressableFeedback()}
											accessibilityRole="button"
											accessibilityLabel={`Add ${suggestion.displayName}`}
										>
											<Ionicons name="add" size={18} color={accent} />
										</Pressable>
									</CardBody>
								</Card>
							))}
						</VerticalStack>
					</View>
				) : null}

				{practitioners.length ? (
					groups.map((group) => (
						<View key={group.key} className="gap-3">
							<Caption>{group.label}</Caption>
							<VerticalStack className="gap-3">
								{group.items.map((practitioner) => (
									<Pressable
										key={practitioner.id}
										onPress={() =>
											router.push(`/practitioners/${practitioner.id}`)
										}
										style={pressableFeedback()}
									>
										<Card variant="outline">
											<CardBody className="gap-1">
												<BodyStrong>
													{formatPractitionerName(practitioner)}
												</BodyStrong>
												<Body className="text-muted">
													{specialtyLabel(
														practitioner.specialty,
														practitioner.specialtyOther,
													)}
												</Body>
												{practitioner.phone ? (
													<Caption>{practitioner.phone}</Caption>
												) : null}
											</CardBody>
										</Card>
									</Pressable>
								))}
							</VerticalStack>
						</View>
					))
				) : (
					<View className="mt-10 items-center gap-2">
						<Ionicons name="person-outline" size={36} color={accent} />
						<BodyStrong>No practitioners</BodyStrong>
						<Body className="text-muted text-center">
							{search.trim()
								? "No results for this search."
								: "Add the doctors, dentists and therapists you see."}
						</Body>
					</View>
				)}
			</VerticalStack>
		</Container>
	);
}
```

- [ ] **Step 3: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/native/features/practitioners/utils.ts apps/native/app/practitioners/index.tsx
git commit -m "feat(native): practitioners list with document suggestions"
```

---

### Task 11: Practitioner detail screen

**Files:**
- Create: `apps/native/app/practitioners/[id].tsx`

**Interfaces:**
- Consumes: `trpc.practitioners.get/save/delete` (Task 6), `trpc.appointments.list` (Task 7), `PractitionerForm` (Task 9), `formatPractitionerName` (Task 10).
- Produces: the `/practitioners/[id]` route.

- [ ] **Step 1: Write the screen**

`apps/native/app/practitioners/[id].tsx`:

```ts
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import {
	PractitionerForm,
	type PractitionerFormValues,
} from "@/components/features/practitioner/practitioner-form";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { queryClient, trpc } from "@/utils/trpc";

type AppointmentListItem = {
	id: string;
	startAt: string | Date;
	reason: string | null;
	location: string | null;
};

export default function PractitionerDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = params.id;
	const accent = useThemeColor("accent");
	const [error, setError] = useState<string | null>(null);

	const practitionerQuery = useQuery({
		...trpc.practitioners.get.queryOptions({ id }),
		enabled: Boolean(id),
	});
	const appointmentsQuery = useQuery({
		...trpc.appointments.list.queryOptions({ practitionerId: id }),
		enabled: Boolean(id),
	});

	const saveMutation = useMutation(
		trpc.practitioners.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the practitioner.");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.practitioners.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't delete the practitioner.");
			},
		}),
	);

	const practitioner = practitionerQuery.data;
	const now = Date.now();
	const upcoming = ((appointmentsQuery.data ?? []) as AppointmentListItem[])
		.filter((item) => new Date(item.startAt).getTime() >= now)
		.slice(0, 5);

	const handleSubmit = (values: PractitionerFormValues) => {
		setError(null);
		saveMutation.mutate({ ...values, id });
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete practitioner",
			"Their appointments are kept, but will no longer be linked to them.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => deleteMutation.mutate({ id }),
				},
			],
		);
	};

	if (practitionerQuery.isPending) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center">
					<Spinner />
				</View>
			</Container>
		);
	}

	if (!practitioner) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center gap-2">
					<BodyStrong>Practitioner not found</BodyStrong>
				</View>
			</Container>
		);
	}

	return (
		<Container className="px-6 pt-4 pb-12">
			<VerticalStack className="gap-6">
				<View className="gap-3">
					{practitioner.phone ? (
						<ContactRow
							icon="call-outline"
							label={practitioner.phone}
							color={accent}
							onPress={() => Linking.openURL(`tel:${practitioner.phone}`)}
						/>
					) : null}
					{practitioner.email ? (
						<ContactRow
							icon="mail-outline"
							label={practitioner.email}
							color={accent}
							onPress={() => Linking.openURL(`mailto:${practitioner.email}`)}
						/>
					) : null}
					{practitioner.address ? (
						<ContactRow
							icon="location-outline"
							label={practitioner.address}
							color={accent}
							onPress={() =>
								Linking.openURL(
									`https://maps.google.com/?q=${encodeURIComponent(
										practitioner.address ?? "",
									)}`,
								)
							}
						/>
					) : null}
				</View>

				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Caption>Upcoming appointments</Caption>
						<Pressable
							onPress={() =>
								router.push(`/calendar/new?practitionerId=${practitioner.id}`)
							}
							className="border-panel-border h-8 w-8 items-center justify-center rounded-full border"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add an appointment"
						>
							<Ionicons name="add" size={16} color={accent} />
						</Pressable>
					</View>
					{upcoming.length ? (
						<VerticalStack className="gap-3">
							{upcoming.map((appointment) => (
								<Pressable
									key={appointment.id}
									onPress={() => router.push(`/calendar/${appointment.id}`)}
									style={pressableFeedback()}
								>
									<Card variant="outline">
										<CardBody className="gap-1">
											<BodyStrong>
												{new Date(appointment.startAt).toLocaleString()}
											</BodyStrong>
											{appointment.reason ? (
												<Body className="text-muted">{appointment.reason}</Body>
											) : null}
										</CardBody>
									</Card>
								</Pressable>
							))}
						</VerticalStack>
					) : (
						<Body className="text-muted">No upcoming appointment.</Body>
					)}
				</View>

				<PractitionerForm
					initial={practitioner}
					onSubmit={handleSubmit}
					isSaving={saveMutation.isPending}
					submitLabel="Save changes"
					error={error}
					onDelete={handleDelete}
					isDeleting={deleteMutation.isPending}
				/>
			</VerticalStack>
		</Container>
	);
}

type ContactRowProps = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	color: string;
	onPress: () => void;
};

function ContactRow({ icon, label, color, onPress }: ContactRowProps) {
	return (
		<Pressable onPress={onPress} style={pressableFeedback()}>
			<Card variant="outline">
				<CardBody className="flex-row items-center gap-3">
					<Ionicons name={icon} size={18} color={color} />
					<Body className="flex-1">{label}</Body>
				</CardBody>
			</Card>
		</Pressable>
	);
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/native/app/practitioners/[id].tsx
git commit -m "feat(native): practitioner detail screen"
```

---

### Task 12: Appointment form

**Files:**
- Create: `apps/native/features/appointments/reminder-offsets.ts`
- Create: `apps/native/components/features/appointment/appointment-form/appointment-form.tsx`
- Create: `apps/native/components/features/appointment/appointment-form/index.ts`

**Interfaces:**
- Consumes: `OptionsPicker`, `DateTimePickerField` (Task 8), `trpc.practitioners.list` (Task 6), `formatPractitionerName` (Task 10).
- Produces:
  - `REMINDER_OFFSET_OPTIONS: { value: string; label: string }[]` and `OFFSET_MINUTES: Record<string, number | null>` and `offsetKeyFromMinutes(minutes: number | null): string` from `@/features/appointments/reminder-offsets`
  - `type AppointmentFormValues = { practitionerId: string | null; startAt: string; reason: string | null; location: string | null; notes: string | null; reminderOffsetMinutes: number | null }`
  - `<AppointmentForm initial onSubmit isSaving submitLabel error onDelete isDeleting />`

- [ ] **Step 1: Write the reminder offsets**

`apps/native/features/appointments/reminder-offsets.ts`:

```ts
/**
 * Reminder presets offered on the appointment form. Minutes are what the server
 * stores (`reminderOffsetMinutes`); null means no reminder.
 */
export const REMINDER_OFFSET_OPTIONS = [
	{ value: "none", label: "No reminder" },
	{ value: "1h", label: "1 hour before" },
	{ value: "1d", label: "1 day before" },
	{ value: "1w", label: "1 week before" },
];

export const OFFSET_MINUTES: Record<string, number | null> = {
	none: null,
	"1h": 60,
	"1d": 1440,
	"1w": 10080,
};

export const DEFAULT_OFFSET_KEY = "1d";

/** Map a stored offset back to a preset key, falling back to "1 day before". */
export function offsetKeyFromMinutes(minutes: number | null | undefined) {
	if (minutes === null || minutes === undefined) return "none";
	const match = Object.entries(OFFSET_MINUTES).find(
		([, value]) => value === minutes,
	);
	return match?.[0] ?? DEFAULT_OFFSET_KEY;
}
```

- [ ] **Step 2: Write the form component**

`apps/native/components/features/appointment/appointment-form/appointment-form.tsx`:

```ts
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Label, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { DateTimePickerField } from "@/components/base/date-time-picker";
import { OptionsPicker } from "@/components/base/options-picker";
import { Caption } from "@/components/base/typography";
import { ensurePermission } from "@/features/reminders/notification-service";
import { usePermissionState } from "@/features/reminders/use-reminders";
import {
	DEFAULT_OFFSET_KEY,
	OFFSET_MINUTES,
	offsetKeyFromMinutes,
	REMINDER_OFFSET_OPTIONS,
} from "@/features/appointments/reminder-offsets";
import {
	formatPractitionerName,
	type PractitionerListItem,
} from "@/features/practitioners/utils";
import { trpc } from "@/utils/trpc";

export type AppointmentFormValues = {
	practitionerId: string | null;
	/** ISO 8601 instant. */
	startAt: string;
	reason: string | null;
	location: string | null;
	notes: string | null;
	reminderOffsetMinutes: number | null;
};

type AppointmentFormProps = {
	initial?: Partial<AppointmentFormValues>;
	onSubmit: (values: AppointmentFormValues) => void;
	isSaving?: boolean;
	submitLabel?: string;
	error?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

const NO_PRACTITIONER = "none";

export function AppointmentForm({
	initial,
	onSubmit,
	isSaving,
	submitLabel = "Save",
	error,
	onDelete,
	isDeleting,
}: AppointmentFormProps) {
	const practitionersQuery = useQuery({
		...trpc.practitioners.list.queryOptions({ search: null }),
	});
	const practitioners = (practitionersQuery.data ??
		[]) as PractitionerListItem[];

	const [practitionerId, setPractitionerId] = useState(
		initial?.practitionerId ?? NO_PRACTITIONER,
	);
	const [startAt, setStartAt] = useState<string | null>(
		initial?.startAt ?? null,
	);
	const [reason, setReason] = useState(initial?.reason ?? "");
	const [location, setLocation] = useState(initial?.location ?? "");
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [offsetKey, setOffsetKey] = useState(
		initial?.reminderOffsetMinutes === undefined
			? DEFAULT_OFFSET_KEY
			: offsetKeyFromMinutes(initial.reminderOffsetMinutes),
	);
	const [localError, setLocalError] = useState<string | null>(null);
	const permission = usePermissionState();

	const practitionerOptions = [
		{ value: NO_PRACTITIONER, label: "No practitioner" },
		...practitioners.map((practitioner) => ({
			value: practitioner.id,
			label: formatPractitionerName(practitioner),
		})),
	];

	const handleSubmit = () => {
		if (!startAt) {
			setLocalError("Pick a date and time.");
			return;
		}
		setLocalError(null);
		// Ask for notification permission the first time a reminder is set. The
		// appointment saves either way; the reminder simply won't fire if denied.
		if (offsetKey !== "none" && permission === "undetermined") {
			void ensurePermission();
		}
		onSubmit({
			practitionerId:
				practitionerId === NO_PRACTITIONER ? null : practitionerId,
			startAt,
			reason: reason.trim() || null,
			location: location.trim() || null,
			notes: notes.trim() || null,
			reminderOffsetMinutes: OFFSET_MINUTES[offsetKey] ?? null,
		});
	};

	return (
		<View className="gap-4">
			<OptionsPicker
				label="Practitioner"
				title="Select a practitioner"
				options={practitionerOptions}
				value={practitionerId}
				onChange={setPractitionerId}
				helperText="Optional — add one from the Practitioners screen first."
			/>

			<DateTimePickerField
				label="Date and time"
				value={startAt}
				onChange={setStartAt}
			/>

			<TextField>
				<Label>Reason</Label>
				<Input
					value={reason}
					onChangeText={setReason}
					placeholder="Annual check-up, follow-up…"
				/>
			</TextField>

			<TextField>
				<Label>Location</Label>
				<Input
					value={location}
					onChangeText={setLocation}
					placeholder="City Clinic, room 4"
				/>
			</TextField>

			<TextField>
				<Label>Notes</Label>
				<Input
					value={notes}
					onChangeText={setNotes}
					placeholder="Bring the last blood test"
					multiline
				/>
			</TextField>

			<OptionsPicker
				label="Reminder"
				title="Remind me"
				options={REMINDER_OFFSET_OPTIONS}
				value={offsetKey}
				onChange={setOffsetKey}
			/>

			{offsetKey !== "none" && permission === "denied" ? (
				<Caption className="text-muted">
					Notifications are off for Mediwise — this reminder won't be delivered
					until you enable them in your device settings.
				</Caption>
			) : null}

			{error || localError ? (
				<Caption className="text-danger">{error ?? localError}</Caption>
			) : null}

			<Button onPress={handleSubmit} isDisabled={isSaving} className="mt-2">
				{isSaving ? (
					<Spinner size="sm" color="default" />
				) : (
					<Button.Label>{submitLabel}</Button.Label>
				)}
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Deleting…" : "Delete appointment"}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
```

`apps/native/components/features/appointment/appointment-form/index.ts`:

```ts
export * from "./appointment-form";
```

- [ ] **Step 3: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/native/features/appointments apps/native/components/features/appointment
git commit -m "feat(native): appointment form"
```

---

### Task 13: Appointment screens under /calendar

**Files:**
- Create: `apps/native/features/appointments/utils.ts`
- Create: `apps/native/app/calendar/new.tsx`
- Create: `apps/native/app/calendar/[id].tsx`
- Modify: `apps/native/app/calendar/index.tsx`
- Modify: `apps/native/app/calendar/_layout.tsx`

**Interfaces:**
- Consumes: `trpc.appointments.*` (Task 7), `AppointmentForm` (Task 12).
- Produces, from `@/features/appointments/utils`:
  - `type AppointmentListItem = { id: string; practitionerId: string | null; practitionerName: string | null; startAt: string | Date; reason: string | null; location: string | null; notes: string | null; reminderOffsetMinutes: number | null }`
  - `splitUpcomingPast(items: AppointmentListItem[], now: Date)` → `{ upcoming: AppointmentListItem[]; past: AppointmentListItem[] }`
  - `groupByMonth(items: AppointmentListItem[])` → `{ key: string; label: string; items: AppointmentListItem[] }[]`
  - `formatAppointmentTime(item: AppointmentListItem): string`

- [ ] **Step 1: Write the list helpers**

`apps/native/features/appointments/utils.ts`:

```ts
export type AppointmentListItem = {
	id: string;
	practitionerId: string | null;
	practitionerName: string | null;
	startAt: string | Date;
	reason: string | null;
	location: string | null;
	notes: string | null;
	reminderOffsetMinutes: number | null;
};

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function toDate(item: AppointmentListItem) {
	return new Date(item.startAt);
}

/** Upcoming sorted soonest-first, past sorted most-recent-first. */
export function splitUpcomingPast(items: AppointmentListItem[], now: Date) {
	const upcoming: AppointmentListItem[] = [];
	const past: AppointmentListItem[] = [];
	for (const item of items) {
		const date = toDate(item);
		if (Number.isNaN(date.getTime())) continue;
		if (date.getTime() >= now.getTime()) upcoming.push(item);
		else past.push(item);
	}
	upcoming.sort((a, b) => toDate(a).getTime() - toDate(b).getTime());
	past.sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
	return { upcoming, past };
}

/** Month buckets, keeping the order of the input list. */
export function groupByMonth(items: AppointmentListItem[]) {
	const groups: { key: string; label: string; items: AppointmentListItem[] }[] =
		[];
	const index = new Map<string, number>();
	for (const item of items) {
		const date = toDate(item);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		const label = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
		if (!index.has(key)) {
			index.set(key, groups.length);
			groups.push({ key, label, items: [] });
		}
		const position = index.get(key);
		if (position !== undefined) groups[position]?.items.push(item);
	}
	return groups;
}

export function formatAppointmentTime(item: AppointmentListItem) {
	const date = toDate(item);
	if (Number.isNaN(date.getTime())) return "—";
	return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}
```

- [ ] **Step 2: Write the list screen**

Replace `apps/native/app/calendar/index.tsx` with:

```ts
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import {
	type AppointmentListItem,
	formatAppointmentTime,
	groupByMonth,
	splitUpcomingPast,
} from "@/features/appointments/utils";
import { trpc } from "@/utils/trpc";

export default function CalendarScreen() {
	const accent = useThemeColor("accent");
	const [showPast, setShowPast] = useState(false);
	const appointmentsQuery = useQuery({
		...trpc.appointments.list.queryOptions({ practitionerId: null }),
	});
	const appointments = (appointmentsQuery.data ?? []) as AppointmentListItem[];
	const { upcoming, past } = splitUpcomingPast(appointments, new Date());
	const upcomingGroups = groupByMonth(upcoming);

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/calendar/new")}
							className="h-9 w-9 items-center justify-center rounded-full"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add an appointment"
						>
							<Ionicons name="add" size={22} color={accent} />
						</Pressable>
					),
				}}
			/>

			<VerticalStack className="gap-6">
				{upcoming.length ? (
					upcomingGroups.map((group) => (
						<View key={group.key} className="gap-3">
							<Caption>{group.label}</Caption>
							<VerticalStack className="gap-3">
								{group.items.map((appointment) => (
									<AppointmentRow
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</VerticalStack>
						</View>
					))
				) : (
					<View className="mt-10 items-center gap-2">
						<Ionicons name="calendar-outline" size={36} color={accent} />
						<BodyStrong>No upcoming appointment</BodyStrong>
						<Body className="text-muted text-center">
							Add your next appointment to get a reminder before it.
						</Body>
					</View>
				)}

				{past.length ? (
					<View className="gap-3">
						<Pressable
							onPress={() => setShowPast((current) => !current)}
							className="flex-row items-center gap-2"
							style={pressableFeedback()}
							accessibilityRole="button"
						>
							<Ionicons
								name={showPast ? "chevron-down" : "chevron-forward"}
								size={16}
								color={accent}
							/>
							<Caption>{`Past appointments (${past.length})`}</Caption>
						</Pressable>
						{showPast ? (
							<VerticalStack className="gap-3">
								{past.map((appointment) => (
									<AppointmentRow
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</VerticalStack>
						) : null}
					</View>
				) : null}
			</VerticalStack>
		</Container>
	);
}

function AppointmentRow({
	appointment,
}: {
	appointment: AppointmentListItem;
}) {
	return (
		<Pressable
			onPress={() => router.push(`/calendar/${appointment.id}`)}
			style={pressableFeedback()}
		>
			<Card variant="outline">
				<CardBody className="gap-1">
					<Caption>{formatAppointmentTime(appointment)}</Caption>
					<BodyStrong>
						{appointment.practitionerName ?? "Appointment"}
					</BodyStrong>
					{appointment.reason ? (
						<Body className="text-muted" numberOfLines={2}>
							{appointment.reason}
						</Body>
					) : null}
					{appointment.location ? (
						<Caption>{appointment.location}</Caption>
					) : null}
				</CardBody>
			</Card>
		</Pressable>
	);
}
```

- [ ] **Step 3: Write the create screen**

`apps/native/app/calendar/new.tsx`:

```ts
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
	AppointmentForm,
	type AppointmentFormValues,
} from "@/components/features/appointment/appointment-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function NewAppointmentScreen() {
	// Prefilled when coming from a practitioner's detail screen.
	const params = useLocalSearchParams<{ practitionerId?: string }>();
	const [error, setError] = useState<string | null>(null);

	const saveMutation = useMutation(
		trpc.appointments.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the appointment.");
			},
		}),
	);

	const handleSubmit = (values: AppointmentFormValues) => {
		setError(null);
		saveMutation.mutate(values);
	};

	return (
		<Container className="px-6 pt-4 pb-12">
			<AppointmentForm
				initial={{ practitionerId: params.practitionerId ?? null }}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Add appointment"
				error={error}
			/>
		</Container>
	);
}
```

- [ ] **Step 4: Write the detail screen**

`apps/native/app/calendar/[id].tsx`:

```ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useState } from "react";
import { Alert, View } from "react-native";

import { BodyStrong } from "@/components/base/typography";
import {
	AppointmentForm,
	type AppointmentFormValues,
} from "@/components/features/appointment/appointment-form";
import { Container } from "@/components/layout/container";
import { queryClient, trpc } from "@/utils/trpc";

export default function AppointmentDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = params.id;
	const [error, setError] = useState<string | null>(null);

	const appointmentQuery = useQuery({
		...trpc.appointments.get.queryOptions({ id }),
		enabled: Boolean(id),
	});

	const saveMutation = useMutation(
		trpc.appointments.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't save the appointment.");
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.appointments.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (mutationError) => {
				setError(mutationError.message || "Couldn't delete the appointment.");
			},
		}),
	);

	const appointment = appointmentQuery.data;

	const handleSubmit = (values: AppointmentFormValues) => {
		setError(null);
		saveMutation.mutate({ ...values, id });
	};

	const handleDelete = () => {
		Alert.alert("Delete appointment", "This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => deleteMutation.mutate({ id }),
			},
		]);
	};

	if (appointmentQuery.isPending) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center">
					<Spinner />
				</View>
			</Container>
		);
	}

	if (!appointment) {
		return (
			<Container className="px-6 pt-10" scroll={false}>
				<View className="flex-1 items-center justify-center gap-2">
					<BodyStrong>Appointment not found</BodyStrong>
				</View>
			</Container>
		);
	}

	return (
		<Container className="px-6 pt-4 pb-12">
			<AppointmentForm
				initial={{
					practitionerId: appointment.practitionerId,
					startAt: new Date(appointment.startAt).toISOString(),
					reason: appointment.reason,
					location: appointment.location,
					notes: appointment.notes,
					reminderOffsetMinutes: appointment.reminderOffsetMinutes,
				}}
				onSubmit={handleSubmit}
				isSaving={saveMutation.isPending}
				submitLabel="Save changes"
				error={error}
				onDelete={handleDelete}
				isDeleting={deleteMutation.isPending}
			/>
		</Container>
	);
}
```

- [ ] **Step 5: Register the screens in the layout**

Replace `apps/native/app/calendar/_layout.tsx` with:

```ts
import { Stack } from "expo-router";

import { HeaderBack } from "@/components/base/header-back-button";

export default function CalendarLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "Appointments",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					headerShown: true,
					title: "New appointment",
					headerLeft: () => <HeaderBack />,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: "Appointment",
					headerLeft: () => <HeaderBack />,
				}}
			/>
		</Stack>
	);
}
```

- [ ] **Step 6: Typecheck**

Run: `bun run check-types`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/native/features/appointments/utils.ts apps/native/app/calendar
git commit -m "feat(native): appointment list, create and detail screens"
```

---

### Task 14: Appointment notification sync

**Files:**
- Create: `apps/native/features/appointments/notification-service.ts`
- Create: `apps/native/features/appointments/use-appointments.ts`
- Create: `apps/native/features/appointments/appointment-sync.tsx`
- Modify: `apps/native/app/_layout.tsx`

**Interfaces:**
- Consumes: `trpc.appointments.schedule` (Task 7); permission helpers from `@/features/reminders/notification-service`.
- Produces:
  - `type AppointmentScheduleEntry = { appointmentId: string; title: string; body: string; triggerAt: string }`
  - `syncAppointmentNotifications(schedule: AppointmentScheduleEntry[]): Promise<void>`
  - `<AppointmentSync />` and `useAppointmentNotificationObserver()`

- [ ] **Step 1: Write the notification service**

`apps/native/features/appointments/notification-service.ts`:

```ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Mirrors the server's computed schedule shape
// (packages/domain appointments service).
export type AppointmentScheduleEntry = {
	appointmentId: string;
	title: string;
	body: string;
	/** ISO 8601 UTC instant at which the notification fires. */
	triggerAt: string;
};

export const APPOINTMENT_DATA_TYPE = "appointment-reminder";
const ANDROID_CHANNEL_ID = "appointment-reminders";

async function ensureAndroidChannel() {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
		name: "Appointment reminders",
		importance: Notifications.AndroidImportance.HIGH,
		lightColor: "#0d9488",
	});
}

/**
 * Cancel only the notifications this feature scheduled, leaving medication
 * reminders untouched.
 */
export async function cancelAppointmentNotifications() {
	const scheduled = await Notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduled
			.filter((item) => item.content.data?.type === APPOINTMENT_DATA_TYPE)
			.map((item) =>
				Notifications.cancelScheduledNotificationAsync(item.identifier),
			),
	);
}

/**
 * Reconcile OS notifications with the given schedule: cancel ours and
 * re-schedule from scratch. One one-shot DATE trigger per appointment.
 */
export async function syncAppointmentNotifications(
	schedule: AppointmentScheduleEntry[],
) {
	await ensureAndroidChannel();
	await cancelAppointmentNotifications();

	const now = Date.now();
	for (const entry of schedule) {
		const date = new Date(entry.triggerAt);
		if (Number.isNaN(date.getTime()) || date.getTime() <= now) continue;
		await Notifications.scheduleNotificationAsync({
			content: {
				title: entry.title,
				body: entry.body,
				sound: true,
				data: {
					type: APPOINTMENT_DATA_TYPE,
					appointmentId: entry.appointmentId,
				},
				...(Platform.OS === "android"
					? { channelId: ANDROID_CHANNEL_ID }
					: {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date,
			},
		});
	}
}
```

Note: the foreground notification handler and the permission helpers are already
set up once in `@/features/reminders/notification-service`; do not duplicate
`setNotificationHandler` here.

- [ ] **Step 2: Write the hooks**

`apps/native/features/appointments/use-appointments.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import type { PermissionState } from "@/features/reminders/notification-service";
import { trpc } from "@/utils/trpc";

import {
	APPOINTMENT_DATA_TYPE,
	type AppointmentScheduleEntry,
	syncAppointmentNotifications,
} from "./notification-service";

export function useAppointmentScheduleQuery() {
	return useQuery({ ...trpc.appointments.schedule.queryOptions() });
}

/**
 * Keep OS-scheduled notifications in sync with the server schedule: re-sync
 * whenever the schedule changes and whenever the app returns to the foreground.
 */
export function useAppointmentSync(
	schedule: AppointmentScheduleEntry[] | undefined,
	permission: PermissionState,
) {
	const serialized = JSON.stringify(schedule ?? []);

	useEffect(() => {
		if (permission !== "granted") return;
		const parsed = JSON.parse(serialized) as AppointmentScheduleEntry[];
		void syncAppointmentNotifications(parsed);
	}, [serialized, permission]);

	useEffect(() => {
		const handler = (state: AppStateStatus) => {
			if (state !== "active" || permission !== "granted") return;
			const parsed = JSON.parse(serialized) as AppointmentScheduleEntry[];
			void syncAppointmentNotifications(parsed);
		};
		const sub = AppState.addEventListener("change", handler);
		return () => sub.remove();
	}, [serialized, permission]);
}

function openAppointmentFromResponse(
	response: Notifications.NotificationResponse,
) {
	const data = response.notification.request.content.data;
	if (data?.type !== APPOINTMENT_DATA_TYPE) return;
	const id = typeof data.appointmentId === "string" ? data.appointmentId : "";
	if (!id) return;
	router.push({ pathname: "/calendar/[id]", params: { id } });
}

/** Deep-link into an appointment when its reminder is tapped. */
export function useAppointmentNotificationObserver() {
	const lastResponse = Notifications.useLastNotificationResponse();
	useEffect(() => {
		if (lastResponse) openAppointmentFromResponse(lastResponse);
	}, [lastResponse]);

	useEffect(() => {
		const sub = Notifications.addNotificationResponseReceivedListener(
			openAppointmentFromResponse,
		);
		return () => sub.remove();
	}, []);
}
```

- [ ] **Step 3: Write the sync component**

`apps/native/features/appointments/appointment-sync.tsx`:

```ts
import { usePermissionState } from "@/features/reminders/use-reminders";

import type { AppointmentScheduleEntry } from "./notification-service";
import {
	useAppointmentScheduleQuery,
	useAppointmentSync,
} from "./use-appointments";

/**
 * App-root gate keeping appointment notifications in sync with the server
 * schedule, regardless of which screen is focused. Renders nothing.
 */
export function AppointmentSync() {
	const scheduleQuery = useAppointmentScheduleQuery();
	const permission = usePermissionState();
	const schedule = scheduleQuery.data as
		| AppointmentScheduleEntry[]
		| undefined;
	useAppointmentSync(schedule, permission);
	return null;
}
```

- [ ] **Step 4: Mount it at the app root**

In `apps/native/app/_layout.tsx`, add the imports:

```ts
import { AppointmentSync } from "@/features/appointments/appointment-sync";
import { useAppointmentNotificationObserver } from "@/features/appointments/use-appointments";
```

and change `StackLayout` to:

```ts
function StackLayout() {
	useReminderNotificationObserver();
	useAppointmentNotificationObserver();
	return (
		<>
			<ReminderSync />
			<AppointmentSync />
			<StackScreens />
		</>
	);
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `bun run check-types && bun run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/native/features/appointments apps/native/app/_layout.tsx
git commit -m "feat(native): appointment reminder notifications"
```

---

### Task 15: Manual verification and TODO update

**Files:**
- Modify: `TODO.md`

**Interfaces:**
- Consumes: everything above.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Run the full check suite**

Run: `bun test packages/domain/src/practitioners/service.test.ts packages/domain/src/appointments/service.test.ts`
Expected: PASS, 13 tests.

Run: `bun run check-types && bun run lint`
Expected: no errors.

- [ ] **Step 2: Smoke-test the app**

Start the stack (`bun run dev:server` and `bun run dev:native`, database running) and walk through:

1. Home → Practitioners petal → `+` → fill last name, pick a specialty, save → the practitioner appears under their specialty section.
2. With a scanned exam or prescription that has a doctor name: the `Found in your documents` block lists it; tapping `+` opens the form prefilled; after saving, that suggestion disappears.
3. Practitioner detail → tap phone / email / address → the dialer, mail app and maps open.
4. Practitioner detail → `+` next to `Upcoming appointments` → the form opens with that practitioner selected → save → the appointment shows on the practitioner screen and under the Calendar petal.
5. Calendar → an appointment in the past sits under `Past appointments`, collapsed by default.
6. Create an appointment ~2 minutes out with the reminder set to `1 hour before` → it is silently skipped (trigger already past). Then set an appointment far enough ahead that the reminder fires, background the app, and confirm the notification arrives and opens the appointment.
7. Delete a practitioner → their appointments remain in the Calendar list, still showing the name.

Note any failure and fix it before the final commit.

- [ ] **Step 3: Update the product TODO**

In `TODO.md`, replace the `## 6.7` and `## 6.8` sections with:

```markdown
## 6.7 Rendez-vous médicaux — 🟡

**Fait**

- Modèle data RDV : `packages/db/src/models/appointments.model.ts` (praticien, date+heure, lieu, motif, notes, rappel)
- Liste chronologique groupée par mois + passés repliés : `apps/native/app/calendar/index.tsx`
- Ajouter / modifier / supprimer : `apps/native/app/calendar/{new,[id]}.tsx`
- Rappel push par RDV (aucun / 1h / 1 jour / 1 semaine avant) : `apps/native/features/appointments/`
- Création du RDV depuis la fiche praticien (6.8)

**À faire**

- [ ] Vue calendrier mensuelle (voir 6.9)
- [ ] Liste groupée par année (aujourd'hui : par mois)

## 6.8 Annuaire professionnels de santé — 🟡

**Fait**

- Modèle data pro : `packages/db/src/models/practitioners.model.ts` (nom, prénom, spécialité, tél, adresse, email, notes)
- Liste groupée par spécialité + recherche : `apps/native/app/practitioners/index.tsx`
- CRUD fiche pro : `apps/native/app/practitioners/{new,[id]}.tsx`
- Suggestions « Found in your documents » depuis `exam.doctor` et `prescription_unified.data.prescriberName`, à valider par l'utilisateur
- Association pro ↔ RDV (6.7)

**À faire**

- [ ] Association pro ↔ examen (6.6)
```

Also update the overview table rows: `6.7 Rendez-vous médicaux` → `🟡`, `6.8 Annuaire professionnels de santé` → `🟡`.

- [ ] **Step 4: Commit**

```bash
git add TODO.md
git commit -m "docs: mark practitioner directory and appointments as delivered"
```

---

## Spec coverage check

| Spec section | Task |
| --- | --- |
| Practitioner data model | 1 |
| Appointment data model | 1 |
| Practitioners repository + document names | 2 |
| Appointments repository + detach on delete | 3, 2 |
| Domain: normalization, suggestions | 4 |
| Domain: reminder schedule | 5 |
| Practitioners tRPC router | 6 |
| Appointments tRPC router | 7 |
| Specialty list, pickers | 8 |
| Practitioner form, create screen | 9 |
| Directory list + suggestions block | 10 |
| Practitioner detail, contact actions, per-practitioner appointments | 11 |
| Appointment form, reminder presets | 12 |
| Appointment list / create / detail under `/calendar` | 13 |
| Notification sync, deep link, permission fallback | 14 |
| Tests + manual verification + TODO | 15 |
