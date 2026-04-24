# Prompt 01 — Preview / Confirm / Commit Upload Runway

## Objective

Replace the direct `Submit checklist` flow with a preview-first, commit-gated workflow.

## Governing authorities

- Backend preview route: `/api/safety-records/ingest/preview`
- Backend commit route: `/api/safety-records/ingest`
- `SafetyIngestionPreviewResult.commitReadiness`
- React/TanStack async state best practices

## Files / seams to inspect

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/components/*`
- `packages/features/safety/src/hooks/queries.ts`

## Current gap

Public-main UploadPage submits directly and does not reflect the backend preview-before-commit design.

## Required implementation outcome

Implement:
- `Preview checklist` action;
- `Commit inspection` action;
- commit disabled until latest preview is commit-ready;
- preview signature based on file + reporting period + project + inspection date/number;
- preview invalidation when context changes;
- explicit confirmation checkbox;
- cancel preview/commit;
- terminal outcome zone.

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
