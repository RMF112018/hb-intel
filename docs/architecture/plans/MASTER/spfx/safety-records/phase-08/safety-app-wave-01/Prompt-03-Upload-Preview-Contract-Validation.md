# Prompt 03 — Upload Preview Contract Validation

## Objective

Align UploadPage intake validation and copy with backend parser authority and route validation.

## Governing authorities

- `apps/safety/src/pages/UploadPage.tsx`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

## Current gap

The UI and backend/parser contract do not fully match:

- UI validates `inspectionDate` by regex shape only.
- UI copy says inspection number may be non-negative; parser expects positive integer.
- UI says an open reporting period is required but defaults to the first period without enforcing open status.
- `uploadedByUpn` can fall back to a hardcoded coordinator identity.

## Required implementation outcome

- Use exact plain-calendar-date validation equivalent to backend route validation.
- Enforce positive integer inspection number and update all copy/tests.
- Make reporting-period status requirements explicit and enforced.
- Replace hardcoded uploaded-by fallback with authenticated SPFx/user context or remove trust in frontend-supplied identity.
- Preserve parser-authority UX: markered parser-meta/named-range values remain authoritative.
- Add tests for invalid date, invalid inspection number, closed/published period behavior, and metadata mismatch display.

## Proof of closure

- Unit/component tests for validation alignment.
- Upload mutation payload tests.
- Evidence that backend remains the authority for actual workbook validation.
- No unrelated UI redesign.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
