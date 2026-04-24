# Prompt-02-State-Error-Truthfulness-And-Support-Surface.md

## Objective

Make Safety terminal states, retry/replay states, and failure messaging truthful to the actual failing seam and useful for production support.

## Governing authorities

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/components/SafetyIngestionOutcome.tsx`
- `packages/features/safety/src/domain/types.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/utils/response-helpers.ts`
- prior Safety documentation about misleading/collapsed failure states

## Current gap to close

The current UI still collapses too much of the backend truth:
- request IDs are not surfaced
- failure classes are not surfaced
- support value is limited
- some copy still implies the wrong source of truth or wrong failing seam

## Required implementation outcome

1. Surface bounded support details where they materially help:
   - request ID
   - terminal failure class
   - preview failure class when relevant
2. Distinguish:
   - configuration/bootstrap failure
   - auth failure
   - preview blocker
   - commit failure
   - replay failure
   - read-side list failure
3. Ensure retry/replay actions are scoped to the correct seam and copy.
4. Make the authority model explicit:
   - if operator-entered values remain authoritative, say so clearly
   - if the authority model changes, reflect the new truth everywhere.

## Proof of closure required

- before/after state matrix for Upload and Review surfaces
- tests proving distinct failures render distinct messaging
- evidence that support-visible details are bounded and not dumped indiscriminately

## Prohibitions

- do not replace specific failures with generic “something went wrong”
- do not expose raw backend internals without curation
- do not change unrelated pages

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
