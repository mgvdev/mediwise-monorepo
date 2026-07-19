# Medical record & unified prescription sheet — design

Date: 2026-07-19
Covers: [issue #1](https://github.com/mgvdev/mediwise-monorepo/issues/1) — "Redesign ordonnance unique et fiche medical".

## Goal

Give the user a single paper-like page that reads as a real prescription sheet:
a "Medical record" sheet followed, on scroll, by a "Unified prescription" sheet.
The homepage flower gains one entry point for both, and a placeholder for the
future scan flow.

## Decisions

- The two existing petals `Tracking` and `Prescriptions` merge into one petal
  labelled **Medical records** pointing at a new route `/medical-record`.
- The freed slot becomes a **Scan** placeholder petal: it renders like the
  others but is inert (toast "Coming soon"). No scan screen in this batch.
- The new page lives at `/medical-record`. `/health/overview` and
  `/prescriptions/current` are **kept**. No petal points at them any more, so
  the new page carries a footer link on each sheet: "See full record" →
  `/health/overview` and "See all treatments" → `/prescriptions/current`.
  `/prescriptions/current` also stays reachable from the Documents tab card.
- Visual direction: **plain A4 sheet**, not the decorative receipt from the
  Dribbble reference — white sheet, header rule, sans-serif from the existing
  design system. Two sheets stacked, separated by page background.
- Edit affordance on the **medical record sheet only** (pencil → `/health`).
  The prescription sheet is read-only in this batch.
- The prescription sheet shows **active treatments only**. Past treatments stay
  on `/prescriptions/current`.
- "Antécédents médicaux" is **derived** from the existing specialty categories.
  No DB schema change, no new health-schema field.
- All UI strings are English.

## Out of scope

Editing the unified prescription, a real Scan screen, DB schema changes,
migrating or deleting `/health/overview`, blood-pressure history.

## Navigation (`apps/native/components/features/flower-nav/`)

`petal-config.ts` — the `Petal` type gains `placeholder?: boolean`. Final
`PETALS` array, angles unchanged (0 / 72 / 144 / 216 / 288):

| # | key | label | icon | route | color |
| --- | --- | --- | --- | --- | --- |
| 1 | `medical_records` | Medical records | `clipboard-outline` | `/medical-record` | `#2FB89C` teal (kept from `prescriptions`) |
| 2 | `calendar` | Calendar | `calendar-outline` | `/calendar` | `#57BE8C` |
| 3 | `documents` | Documents | `document-text-outline` | `/documents` | `#E4885C` |
| 4 | `practitioners` | Practitioners | `person-outline` | `/practitioners` | `#6BA0DE` |
| 5 | `scan` | Scan | `scan-outline` | — | `#E6B549` (kept from `tracking`) |

`flower-nav.tsx` — the petal press handler branches: when `placeholder` is set,
show a toast ("Scan is coming soon") instead of `router.push`. `route` becomes
optional on the type; a placeholder petal declares no route.

Accessibility label and rendering are otherwise unchanged.

## Route

- `app/medical-record/_layout.tsx` — `Stack`, screen title "Medical record".
- `app/medical-record/index.tsx` — one `ScrollView` holding the two sheets.
- `app/_layout.tsx` — register the `medical-record` stack alongside `health`,
  `prescriptions`, etc.

Loading: both queries in flight → spinner. Query error → error card with retry,
per sheet (a failing prescription query must not hide the medical record).

## Components (`apps/native/components/features/medical-record/`)

Each in its own folder with an `index.ts`, matching the existing convention
under `components/features/`.

- `paper-sheet/` — the sheet chrome. Props: `title`, `meta?` (e.g. "Updated
  Jul 19, 2026"), `onEdit?`, `children`. Renders a white surface with a thin
  rule under the header, soft shadow, generous padding. The pencil action only
  renders when `onEdit` is passed.
- `sheet-row/` — one `label` / `value` line, value right-aligned, muted label.
- `sheet-list/` — `label` plus a bullet list, or the literal `None` when the
  list is empty.
- `medical-record-sheet/` — sheet A. Consumes `trpc.healthData.get`, maps it
  through the selector below, renders identity, vitals, habits, allergies and
  the three history blocks, then any non-empty specialty block, then a "See
  full record" link to `/health/overview`.
- `prescription-sheet/` — sheet B. Consumes
  `trpc.prescriptions.unified.current` and
  `trpc.prescriptions.unified.interactions`.

## Selector (`apps/native/features/medical-record/select-medical-record.ts`)

Pure TypeScript, no React Native import, so it runs under `bun test`. Input is
the `HealthDataMap` returned by `trpc.healthData.get` plus the
`healthCategories` schema from `app/health/health-schema.ts` (for labels).

`selectMedicalRecord(data)` returns:

```ts
type MedicalRecordView = {
  identity: {
    lastName: string | null;
    firstName: string | null;
    birthDate: string | null;
    age: number | null;
    sex: "male" | "female" | null;
  };
  vitals: {
    height: { value: number; unit: "cm" | "inch" } | null;
    weight: { value: number; unit: "kg" | "lbs" } | null;
    bloodGroup: string | null;
    bloodPressure: {
      raw: string | null;
      status: "normal" | "abnormal" | "unknown";
    };
  };
  habits: Array<{ label: string; answer: "yes" | "no" | "unknown"; comment: string | null }>;
  allergies: string[];               // empty -> the UI renders "None"
  medicalHistory: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  specialtySections: Array<{ label: string; entries: Array<{ label: string; value: string }> }>;
};
```

Rules:

- **Always rendered**, with `None` / `Unknown` when empty: last name, first
  name, birth date (+ computed age), sex, height, weight, blood group, blood
  pressure status, tobacco, alcohol, drugs, allergies, medical history,
  surgical history, family history.
- `classifyBloodPressure(raw)` parses `"<systolic>/<diastolic>"`. `normal` when
  systolic is 90–129 **and** diastolic is 60–84; any other parsed pair is
  `abnormal`; unparsable, empty or missing is `unknown`. The raw value is shown
  next to the status when present.
- `medicalHistory` aggregates every field answered `yes` or `suspected` across
  the specialty categories (`cardiology`, `pulmonology`, `neurology`,
  `endocrinology`, `psychiatry`, `gynecology`, `obstetrics`), formatted
  `"<Category label> — <Field label>"`, with a ` (suspected)` suffix for
  `suspected`. Empty result renders `None`.
- `surgicalHistory` reads `surgical_history.details`. `familyHistory` collects
  the `family_history` fields answered `yes`, using their schema labels;
  `cancer_details` is appended to the `Cancer` entry when present.
- `specialtySections` keeps a specialty category **only when it has at least one
  non-empty answer**. Categories filtered out by sex
  (`filterHealthCategoriesBySex`) are excluded before the check.
- Age is computed from `birth_date` against the current date, passed in as an
  argument so tests are deterministic.

## Prescription sheet data

- `trpc.prescriptions.unified.current` → active treatments.
- `trpc.prescriptions.unified.interactions` → renders the existing
  `InteractionAlert` above the treatment list.
- Empty list → the existing `UnifiedPrescriptionEmpty` component.
- Per treatment: name, dosage, form, schedule, and duration or a `Chronic`
  badge. `formatSchedule` currently lives inline in
  `app/prescriptions/current.tsx:17-31`; it moves to
  `features/prescriptions/utils.ts` and both screens import it from there.
- Footer link "See all treatments" → `/prescriptions/current`.

## Tests

`apps/native/package.json` gains `"test": "bun test"` — the first tests in this
workspace. `select-medical-record.test.ts` covers:

- `classifyBloodPressure`: normal inside bounds, abnormal at each boundary
  (89/…, 130/…, …/59, …/85), unknown on empty and on garbage input.
- Age computed from `birth_date` with a fixed reference date, including the
  before/after-birthday cases.
- `medicalHistory` derivation: `yes` and `suspected` included with correct
  labels and suffix, `no` and empty excluded, empty overall result.
- `surgicalHistory` / `familyHistory` / `allergies` empty → empty array (UI
  renders `None`).
- `specialtySections` drops fully-empty categories and keeps partially-filled
  ones.
- Sex filtering: female-only categories absent for a male profile.

TDD: tests are written before the selector implementation.

## Build order

1. Selector tests + selector.
2. `paper-sheet` / `sheet-row` / `sheet-list` primitives.
3. `medical-record-sheet`.
4. `formatSchedule` extraction + `prescription-sheet`.
5. `/medical-record` route wiring.
6. Flower menu petal changes.
