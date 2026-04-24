# Prompt-03-Timeout-Abort-Request-Id-And-Release-Proof.md

## Objective

Harden the Safety backend command seam so it behaves like a supportable production client instead of a raw fetch helper.

## Governing authorities

- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/functions/health/index.ts`
- `backend/functions/src/functions/health/ready.ts`
- Azure retry/transient-fault guidance
- MDN Fetch / AbortController guidance

## Current gap to close

Backend command calls currently lack:
- AbortController cancellation
- bounded timeout semantics
- deliberate transient-fault retry classification
- frontend-generated request correlation
- release-proof verification that a packaged/mounted frontend is wired to the intended backend

## Required implementation outcome

1. Add cancellation + timeout behavior for backend commands.
2. Add bounded retry only for clearly transient classes; never auto-retry contract/gate failures.
3. Generate and preserve request correlation IDs end-to-end where appropriate.
4. Add release/smoke proof that verifies:
   - backend liveness,
   - authenticated command round-trip path,
   - config binding presence,
   - preview route reachability.

## Exact seams / files / symbols to inspect

- backend command invocation code
- upload submission path
- replay path
- any test harness or release-proof scripts that validate Safety wiring

## Proof of closure required

- tests for timeout and abort classification
- tests or smoke harness proving request correlation survives command execution
- explicit verification artifact or script for mounted Safety/backend wiring truth

## Prohibitions

- do not implement aggressive auto-retry loops
- do not suppress failures behind infinite retry behavior
- do not add superficial console logging and call it observability

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
