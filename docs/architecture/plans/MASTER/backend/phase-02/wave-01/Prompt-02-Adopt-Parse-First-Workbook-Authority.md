# Prompt 02 — Adopt Parse-First Workbook Authority

## Objective

Complete the parse-first workbook contract adoption so the backend, not the intake context, is authoritative for parser-critical Safety values.

This closure must align the current code with the stronger workbook contract described by the parser stack:
- `ParserMeta`
- named ranges
- template markers
- parser contract markers
- key findings seam
- reporting-period derivation markers

## Governing authorities

Use these as the implementation authorities:

- current parser contract code on `main`
- the explicit parser-first direction already encoded in the Safety parser files
- current preview/validation flow
- the requirement that the visible field-user workflow is unchanged while backend parsing becomes more deterministic

## Files and seams to inspect

At minimum inspect and work from:

- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/parser/parseChecklist.ts`
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- any `UploadContext` / inspection metadata types used by preview/ingest

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current backend gap to close

The parser stack already prefers:
1. `ParserMeta`
2. named ranges
3. legacy fallback only when markers are absent

But the preview evaluator still lets request-context `inspectionDate` and `inspectionNumber` override parsed workbook values.

That is the gap.
Close it.

## Required implementation outcome

Implement the backend so that:

1. parser-derived values become authoritative for:
   - inspection date
   - inspection number
   - project/site text
   - key findings normalization
   - reporting-period derivation markers when present

2. request-context values for `inspectionDate` / `inspectionNumber` are no longer silent overrides
   - they may be used for comparison
   - they may generate mismatch diagnostics
   - they may not displace parser authority without an explicit governed rule

3. preview returns explicit source-of-value diagnostics for parser-critical fields, such as:
   - `parser-meta`
   - `named-range`
   - `legacy`
   - `none`

4. incompatible template diagnostics are explicit and actionable

5. fallback behavior remains supported only where appropriate for legacy/no-marker templates

## Proof of closure required

At minimum add or update tests that prove:

- parser-meta beats named range
- named range beats legacy fallback
- legacy fallback is disabled when parser markers are present
- intake context no longer silently overrides parsed inspection date / number
- preview emits mismatch diagnostics when user-entered values disagree with parsed values
- template/version/reporting-period marker failures are explicit

## Constraints

- do not redesign the field-user workbook workflow
- do not remove legacy fallback for genuinely legacy/no-marker templates unless a better governed compatibility path is implemented
- do not create hidden fallback behavior that weakens parser authority
- no unrelated frontend changes

