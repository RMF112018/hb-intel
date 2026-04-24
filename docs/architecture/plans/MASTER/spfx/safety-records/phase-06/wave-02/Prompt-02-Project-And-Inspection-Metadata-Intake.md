# Prompt 02 — Project Picker and Inspection Metadata Intake

## Objective

Add project selection and inspection number/date fields so the frontend sends the full upload context required by backend preview/ingest.

## Governing authorities

- Backend `parseIngestionBody` upload context requirements.
- Project Sites search seam for Projects + Legacy Project Fallback Registry.
- Safety domain `UploadContext`.
- Plain-calendar-date requirement: `YYYY-MM-DD`, no timezone conversion.

## Files / seams to inspect

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/components/SafetyProjectPicker*` or equivalent
- Project Sites package/search seam
- `packages/features/safety/src/domain/types.ts`

## Current gap

Public-main upload sends reporting period and file context only. It omits project selection, project source classification, lookup IDs, inspection number, and inspection date.

## Required implementation outcome

Add:
- project search by number/name;
- current + legacy source classification;
- selected project summary;
- inspection number field;
- inspection date picker/input;
- full `UploadContext` construction;
- validation messages;
- no timezone conversion.

## Proof required

The closure report must include:
- exact files changed;
- route/auth/contract behavior proven;
- before/after screenshots or test output where UI is changed;
- unit/integration tests added or updated;
- build/package commands run and results;
- explicit statement of any remaining risk.

## Change control

Do not make unrelated homepage, shell, publisher, Kudos, or non-Safety changes.

Do not confuse "the UI renders" with "the app is production ready."

Do not re-read files already in active context unless needed to confirm drift, changed dependencies, or uncertainty after changes.
