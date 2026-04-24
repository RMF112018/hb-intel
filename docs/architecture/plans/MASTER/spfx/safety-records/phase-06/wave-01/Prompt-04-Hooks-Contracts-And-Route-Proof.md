# Prompt 04 — Hooks, Contracts, and Route Proof

## Objective

Expose frontend hooks and contract tests that prove Safety preview, ingest, and replay align with the backend route authority.

## Governing authorities

- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `packages/features/safety/src/domain/types.ts`
- current backend response envelopes
- TanStack Query mutation/cancellation best practices

## Files / seams to inspect

- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/index.ts`
- `packages/features/safety/src/adapters/sharepoint/backendContracts.ts`
- `apps/safety/src/pages/UploadPage.tsx`
- test files under `packages/features/safety` and `apps/safety`

## Current gap

Public-main exports do not prove `useSafetyIngestionPreview`, typed backend route contracts, or replay command alignment.

## Required implementation outcome

Implement/export:
- `useSafetyIngestionPreview`;
- `useSafetyIngestion`;
- `useReplayIngestion`;
- typed request/response DTOs aligned to backend;
- tests for preview success, preview 422 contract blocker, ingest success, replay success, 401/403 auth classification, 400 validation classification, `X-Request-Id` propagation, and abort/timeout behavior.

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
