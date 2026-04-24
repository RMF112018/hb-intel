# Prompt 03 — Workbook Contract and Parser Authority UX

## Objective

Expose backend preview diagnostics so operators understand template compatibility, parser authority, period mismatch, project resolution, and duplicate/supersession risk before commit.

## Governing authorities

- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `SafetyIngestionPreviewResult`
- `MetadataAuthority`

## Files / seams to inspect

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/components/*Preview*`
- shared domain types

## Current gap

Public-main UX does not show parser contract version, marker state, metadata authority, period mismatch, project resolution, or duplicate/supersession blockers.

## Required implementation outcome

Preview UI must show:
- template valid/incompatible;
- template version and parser contract version;
- metadata parsed/not parsed;
- metadata authority by field;
- parser/context mismatches;
- reporting-period resolved/date-in-range;
- project resolved/classification;
- duplicate confidence and supersession risk;
- blocking errors and warnings;
- clear copy that parser-meta/named-range values win for markered templates.

Do not state that operator-entered values always win.

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
