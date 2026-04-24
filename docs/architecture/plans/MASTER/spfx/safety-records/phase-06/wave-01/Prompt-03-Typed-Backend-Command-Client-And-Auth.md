# Prompt 03 — Typed Backend Command Client and Auth Propagation

## Objective

Implement a typed frontend backend-command client for Safety preview, ingest, and replay routes with delegated Entra token propagation.

## Governing authorities

- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- Microsoft Entra token guidance: clients treat access tokens as opaque; the API validates.
- Microsoft SPFx AAD client/token guidance.

## Files / seams to inspect

- `packages/features/safety/src/adapters/sharepoint/*`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `apps/safety/src/App.tsx`
- SPFx context token-provider seams

## Current gap

The public-main shared package is REST-oriented and does not prove a production backend command client. The frontend does not acquire an API token, does not send `Authorization`, and does not preserve backend envelopes.

## Required implementation outcome

Add or repair:
- `SafetyBackendCommandClient`;
- `preview`, `ingest`, and `replay` methods;
- exact paths:
  - `/api/safety-records/ingest/preview`
  - `/api/safety-records/ingest`
  - `/api/safety-records/replay`
- JSON body contracts:
  - `{ fileName, fileContentBase64, context }`
  - `{ parentRunId, supersedePrior }`
- `Authorization: Bearer <token>`;
- `X-Request-Id`;
- timeout and abort support;
- bounded retry only for transient statuses;
- typed `SafetyBackendCommandError` preserving request IDs, failure class, preview failure class, graph context, details, operation data, retryability, and attempts.

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
