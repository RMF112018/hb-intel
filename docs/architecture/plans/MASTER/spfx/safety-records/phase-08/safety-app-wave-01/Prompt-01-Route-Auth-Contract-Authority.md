# Prompt 01 — Route/Auth Contract Authority

## Objective

Align the Safety frontend’s command capabilities with the backend’s actual route/action authorization contract.

## Governing authorities

- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/middleware/authorization.ts`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `apps/safety/src/App.tsx`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`

## Current gap

The frontend correctly sends bearer tokens to preview/ingest/replay routes, but the UI does not visibly model the backend route matrix:

- Preview: Submitter, Operator, Reviewer, Admin
- Ingest: Submitter, Operator, Admin
- Replay: Operator, Reviewer, Admin

This means users may discover capability boundaries only through 403 backend failures.

## Required implementation outcome

- Add a frontend Safety capability model that mirrors backend route/action roles.
- Disable or explain unavailable actions before mutation where the current user lacks capability.
- Preserve backend as final authority; do not weaken backend route checks.
- Ensure 401/403 support messages still work if backend denies.
- Add tests proving route capability states for submitter, operator, reviewer, admin, and unauthorized users.

## Proof of closure

- Unit tests for capability matrix.
- Component tests for UploadPage and ReviewQueuePage action availability.
- Evidence that command routes still use the same backend endpoints.
- No unrelated files changed.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
