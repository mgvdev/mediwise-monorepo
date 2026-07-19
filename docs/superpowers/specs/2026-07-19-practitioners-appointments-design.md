# Practitioner directory & appointments — design

Date: 2026-07-19
Covers: TODO 6.8 (annuaire professionnels de santé) and 6.7 (rendez-vous médicaux).

## Goal

A user can keep a directory of the practitioners they see, and record upcoming
appointments with them, with a push reminder before each appointment.

## Decisions

- Practitioner records are created manually. In addition, names already extracted
  from documents (exams, prescriptions) are offered as **suggestions the user
  validates** — nothing is created silently from AI output.
- Appointments: full CRUD + one push reminder per appointment. No monthly
  calendar view in this batch (that belongs to 6.9).
- Navigation: the `Practitioners` petal owns the directory; the `Calendar` petal
  owns the global appointment list. Both routes exist today as stubs and get
  filled in.
- Reminder offset is chosen per appointment from presets.
- Specialty is a predefined list plus a free-text `Other`.
- All UI strings are English.

## Data model (`packages/db`)

Same conventions as `exams.model.ts`: explicit `_id: { type: String }` (UUID
generated in the repository), no `{ timestamps: true }` — `createdAt` /
`updatedAt` are declared in the schema and set by the repository. Both models
are added to the import list and the export block of `packages/db/src/index.ts`.

### `practitioner` (collection `practitioner`)

| field | type | notes |
| --- | --- | --- |
| `_id` | String | UUID |
| `userId` | String | required, every query is scoped by it |
| `tenantId` | String | nullable |
| `firstName` | String | nullable |
| `lastName` | String | required |
| `specialty` | String | required, key from the specialty list (e.g. `cardiologist`, `other`) |
| `specialtyOther` | String | nullable, required by validation when `specialty === "other"` |
| `phone` | String | nullable |
| `email` | String | nullable |
| `address` | String | nullable |
| `notes` | String | nullable |
| `source` | String | `manual` \| `document` — `document` when created from a suggestion |
| `createdAt` | Date | required |
| `updatedAt` | Date | |

### `appointment` (collection `appointment`)

| field | type | notes |
| --- | --- | --- |
| `_id` | String | UUID |
| `userId` | String | required |
| `tenantId` | String | nullable |
| `practitionerId` | String | nullable — set to `null` when the practitioner is deleted |
| `practitionerName` | String | nullable, denormalized snapshot so the list renders without a join and survives practitioner deletion |
| `startAt` | Date | required, sortable |
| `reason` | String | nullable |
| `location` | String | nullable |
| `notes` | String | nullable |
| `reminderOffsetMinutes` | Number | nullable, `null` = no reminder, default `1440` |
| `createdAt` | Date | required |
| `updatedAt` | Date | |

Deleting a practitioner does **not** delete their appointments: the appointments
keep `practitionerName` and have `practitionerId` set to `null`.

## Infrastructure (`packages/infrastructure`)

New folders `src/practitioners/` and `src/appointments/`, each with
`repository.ts`, `types.ts`, `index.ts`, re-exported from `src/index.ts` and
declared as `"./practitioners"` / `"./practitioners/*"` (and the appointments
equivalents) subpath exports in `packages/infrastructure/package.json`.

Practitioners repository:

- `listPractitionersByUser({ userId, search })` — case-insensitive regex over
  `firstName`, `lastName`, `specialtyOther`, `notes`; sorted by `lastName`.
- `getPractitioner({ id, userId })`
- `createPractitioner({ userId, tenantId, fields, source })`
- `updatePractitioner({ id, userId, fields })`
- `deletePractitioner({ id, userId })` — also runs
  `detachPractitionerFromAppointments({ practitionerId, userId })`.
- `listDoctorNamesFromDocuments({ userId })` — distinct non-empty `exam.doctor`
  values, plus `data.prescriberName` from the `prescription_unified` documents of
  that user (`UnifiedPrescriptionData.prescriberName`, see
  `packages/infrastructure/src/prescriptions/types.ts`). Returns the raw display
  names with their occurrence counts; normalization and dedup happen in the
  domain layer.

Appointments repository:

- `listAppointmentsByUser({ userId, practitionerId })` — sorted by `startAt` asc.
- `getAppointment({ id, userId })`
- `createAppointment` / `updateAppointment` / `deleteAppointment`
- `detachPractitionerFromAppointments({ practitionerId, userId })` — `$set`
  `practitionerId: null`, keeps `practitionerName`.

## Domain (`packages/domain`)

Pure functions, no IO, unit-tested next to the source (`service.test.ts`), same
shape as `src/reminders/service.ts`.

`src/practitioners/service.ts`

- `SPECIALTIES` — the ordered list of `{ key, label }` used by both the picker
  and the grouping, ending with `other`.
- `normalizePractitionerName(raw)` — trims, strips leading titles
  (`Dr`, `Dr.`, `Doctor`, `Pr`, `Prof`, `Prof.`), collapses whitespace,
  lowercases. Used as the dedup key only, never displayed.
- `buildSuggestions({ documentNames, existingNames })` — normalizes both sides,
  drops names already present and empty/1-character names, dedups, returns
  `{ displayName, occurrences }[]` sorted by occurrences desc then name asc.
- `groupBySpecialty(practitioners)` — returns
  `{ key, label, items }[]` in `SPECIALTIES` order, empty groups omitted,
  `other` last; items sorted by `lastName`.
- `formatPractitionerName(p)` and `formatSpecialty(p)` — display helpers shared
  by the list, the detail screen and the appointment card.

`src/appointments/service.ts`

- `splitUpcomingPast(appointments, now)` — `{ upcoming, past }`; upcoming sorted
  ascending, past descending. An appointment is upcoming while
  `startAt >= now`.
- `groupByMonth(appointments)` — `{ key: "2026-08", label: "August 2026", items }[]`.
- `REMINDER_OFFSETS` — `[{ key: "none", minutes: null }, { key: "1h", minutes: 60 },
  { key: "1d", minutes: 1440 }, { key: "1w", minutes: 10080 }]`, default `1d`.
- `buildAppointmentSchedule(appointments, now)` — for each appointment with a
  non-null offset, computes `triggerAt = startAt - offset`; entries whose
  `triggerAt <= now` are dropped. Returns
  `{ appointmentId, title, body, triggerAt }[]` sorted by `triggerAt`.

## API (`packages/api`)

Two feature folders following the exams layout (`dto/index.ts`,
`services/index.ts`, `index.ts`), registered in
`packages/api/src/routers/index.ts`. Every procedure is `protectedProcedure`;
routers stay thin adapters that read `ctx.session.user` and delegate to the
services, which map `_id` → `id` and throw `TRPCError`.

`practitionersRouter`

- `list({ search? })`
- `get({ id })` — `NOT_FOUND` if missing
- `save({ id?, ...fields })` — creates when `id` is absent, updates otherwise.
  Zod refinement: `specialtyOther` is required when `specialty === "other"`.
  When the payload carries `source: "document"` on create, it is stored as such.
- `delete({ id })`
- `suggestions()` — `listDoctorNamesFromDocuments` + current practitioners →
  `buildSuggestions`.

`appointmentsRouter`

- `list({ practitionerId? })` — returns all appointments; splitting into
  upcoming/past happens on the client via the domain helper.
- `get({ id })`
- `save({ id?, practitionerId?, startAt, reason?, location?, notes?, reminderOffsetMinutes? })` —
  resolves `practitionerName` from the practitioner when `practitionerId` is
  provided (`NOT_FOUND` if that practitioner is not the user's). When
  `practitionerId` is absent, both `practitionerId` and `practitionerName` are
  stored as `null` — the form does not accept a free-text practitioner name.
- `delete({ id })`

## Native screens (`apps/native`)

### Directory — `app/practitioners/`

- `_layout.tsx` — already exists; add `new` and `[id]` screens with
  `HeaderBack`.
- `index.tsx` — replaces the stub. Search field, sections by specialty, a
  `Found in your documents` block listing suggestions with a `+` that opens
  `new` prefilled with the name and `source=document`, `headerRight` `+`,
  empty state when the directory is empty.
- `new.tsx` — create.
- `[id].tsx` — detail: contact rows opening `tel:`, `mailto:` and the maps URL,
  edit and delete (confirmation mentions that appointments are kept), plus the
  practitioner's upcoming appointments and an "Add appointment" action that
  routes to `/calendar/new?practitionerId=…`.

### Appointments — `app/calendar/`

The existing stub folder is reused so the `Calendar` petal keeps working; the
screen title is `Appointments`. Feature 6.9 will later add the calendar view
alongside this list.

- `index.tsx` — upcoming grouped by month, past collapsed underneath,
  `headerRight` `+`, empty state.
- `new.tsx` / `[id].tsx` — form: practitioner picker (optional), date + time,
  reason, location, notes, reminder preset. `[id].tsx` also deletes.

### Components

- `components/base/specialty-picker/` — reusable bottom-sheet picker over
  `SPECIALTIES` with a free-text field revealed for `other`.
- `components/base/date-time-picker/` — extends the existing
  `components/base/date-picker` to also pick a time.
- `components/base/practitioner-picker/` — bottom-sheet list of the user's
  practitioners, plus a "None" entry.
- `components/features/practitioner/practitioner-form/` and
  `components/features/appointment/appointment-form/` — shared by the `new` and
  `[id]` screens via `initial` / `submitLabel` / `onDelete` props, local
  `useState` per field and manual validation, as `exam-form` does.
- `components/features/appointment/appointment-card/` — row used by both the
  global list and the practitioner detail screen.

Styling uses Tailwind/Uniwind classes and theme tokens only, per `AGENTS.md`.

### Notifications — `apps/native/features/appointments/`

Mirrors `features/reminders/`:

- `notification-service.ts` — `APPOINTMENT_DATA_TYPE = "appointment-reminder"`,
  Android channel `appointment-reminders`, `cancelAppointmentNotifications()`
  (cancel every scheduled notification whose `data.type` matches) then
  `syncScheduledNotifications(schedule)` scheduling one
  `SchedulableTriggerInputTypes.DATE` notification per entry.
- `use-appointments.ts` — query/mutation hooks, `useAppointmentSync(schedule,
  permission)` re-syncing on schedule change and on `AppState` → `active`, and
  `useAppointmentNotificationObserver()` deep-linking a tap to `/calendar/[id]`.
- `appointment-sync.tsx` — renders `null`, mounted in `app/_layout.tsx` next to
  `<ReminderSync />`; the observer hook is called in `StackLayout()`.

Permission reuses the existing notification permission helpers; if permission is
denied, the appointment still saves and the form shows an inline note that
reminders are off.

## Error handling

- Ownership is enforced in the repositories (`userId` in every filter); the API
  layer turns a null/false result into `TRPCError({ code: "NOT_FOUND" })`.
- Client mutations set a local error string surfaced by the form, as in
  `exam-form`.
- A reminder whose trigger time is already past is silently skipped rather than
  scheduled.

## Testing

- Unit tests (bun) for the domain functions: name normalization and dedup,
  suggestion building, upcoming/past split at the boundary, month grouping,
  schedule building including the past-trigger skip and the `none` offset.
- The rest (screens, notification delivery) is verified manually in the app.

## Build order

1. `packages/db` models + barrel.
2. `packages/infrastructure` repositories + package exports.
3. `packages/domain` services + tests.
4. `packages/api` routers, dto, services + registration.
5. Directory screens and components.
6. Appointment screens and components.
7. Notification sync wiring.
8. Update `TODO.md` (6.7 / 6.8).

## Out of scope

- Monthly calendar view and the recommendation engine (6.9).
- External practitioner directory lookup (NPI registry).
- Sharing a practitioner or an appointment with a third party.
- Linking a practitioner to an exam record (6.6 association).
