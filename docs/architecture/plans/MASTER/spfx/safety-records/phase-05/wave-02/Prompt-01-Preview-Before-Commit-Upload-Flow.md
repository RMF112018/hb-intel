# Prompt-01-Preview-Before-Commit-Upload-Flow.md

## Objective

Convert the Safety Upload page from a direct-commit form into a true preview-before-commit workflow aligned with the live backend contract.

## Governing authorities

- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/components/SafetyIngestionOutcome.tsx`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`

## Current gap to close

The backend is preview-first and commit-gated.
The Upload page is still authored as a direct submit/commit form.

## Required implementation outcome

1. Add an explicit preview action and preview state model.
2. Render preview diagnostics for:
   - template compatibility
   - parse/metadata summary
   - reporting period resolution
   - project resolution
   - duplicate/supersession risk
   - commit readiness
3. Do not enable commit until preview says the run is commit-ready.
4. Make the commit action explicitly confirm the previewed context.
5. Preserve the current strong intake structure where it still fits, but stop telling the user that submit immediately writes the record.

## Exact seams / files / symbols to inspect

- Upload page
- ingestion hooks
- preview DTOs already present in domain types
- outcome and readiness components that must now support preview stage(s)

## Proof of closure required

- UI/state tests proving preview runs before commit
- tests proving preview blockers prevent commit
- tests proving warnings vs blockers are differentiated
- code proof that the preview route is actually exercised

## Prohibitions

- do not fake preview in the client
- do not call ingest and simply relabel the result as preview
- do not preserve current direct-submit copy or mental model

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
