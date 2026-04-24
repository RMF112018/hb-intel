# Prompt 01 — Replay Preview and Supersede UX

## Objective

Bring replay/supersede UX up to the same governed standard as upload preview-before-commit.

## Governing authorities

- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/components/SafetyReviewActions*`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`

## Current gap

Replay executes directly from the review queue with optional `supersedePrior`. Backend protects the path, but the UI does not show a replay impact preview equivalent to upload preview.

## Required implementation outcome

- Add a governed replay confirmation flow.
- For supersede actions, show prior run, prior inspection, retained workbook, duplicate/supersession implications, and explicit consequence copy.
- Prevent accidental supersede mutation without confirmation.
- Preserve backend as final authority.
- Add tests for retry vs supersede flows, cancellation, success, and backend failure classification.

## Proof of closure

- Review queue tests for supersede confirmation.
- Replay mutation payload tests.
- UX evidence or screenshots if local E2E harness exists.
- No unrelated changes.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
