# Prompt-03 Closure — Adopt Workbook Parser Contract And Preview Authority

Date: 2026-04-23  
Scope: Safety backend preview/ingest authority enforcement for parser-markered templates.

## Canonical contract after fix

- Markered template (`ParserMeta`/marker seams present):
  - parser-critical fields must resolve from parser-authoritative seams (`parser-meta` or `named-range`),
  - operator-entered context is advisory only,
  - preview emits `PARSER_AUTHORITY_VIOLATION` and blocks commit when a critical field resolves from `legacy` or `none`.
- Markerless template:
  - bounded legacy/context fallback remains allowed.

## Root gap and before evidence

Before this change, preview field-authority resolution in `safety-ingestion-preview-evaluator.ts` was based on per-field source only and did not enforce marker presence.  
That allowed markered workbooks with parser-seam drift (`legacy`/`none`) to continue using context fallback semantics instead of hard-failing parser authority.

## Implementation closure

- Added marker-aware authority enforcement in preview evaluation.
- Added explicit blocking diagnostic: `PARSER_AUTHORITY_VIOLATION`.
- Added preview failure-class mapping: `parser-authority-violation`.
- Updated ingest preview-gate diagnostics to surface `parser-authority-violation` when that is the gating reason.
- Updated Safety domain contract comments to match parser-authority policy.
- Added behavior-first tests for preview authority blocking and ingest commit-gate propagation.
- Added feature-parser tests proving no legacy fallback on markered templates and preserved legacy fallback on markerless templates.

## Verification executed

1. `pnpm --filter @hbc/functions check-types`
2. `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-preview-evaluator.test.ts src/services/__tests__/safety-ingestion-failure-classifier.test.ts src/services/__tests__/safety-ingestion-application-service.test.ts src/functions/adminApi/safety-record-keeping-routes.test.ts`
3. `pnpm --filter @hbc/features-safety check-types`
4. `pnpm --filter @hbc/features-safety test -- src/parser/validateTemplate.test.ts src/parser/extractMetadata.test.ts src/ingestion/runIngestionPipeline.test.ts`

## After evidence

- `safety-ingestion-preview-evaluator.test.ts`:
  - `blocks markered templates when parser-critical fields resolve from non-parser seams`
  - `uses intake context for markerless/legacy templates where parser source is none`
- `safety-ingestion-application-service.test.ts`:
  - `blocks ingest commit and returns parser-authority-violation when preview detects parser seam drift`
- `safety-ingestion-failure-classifier.test.ts`:
  - `classifies parser-authority-violation when parser seam authority is broken`
- `extractMetadata.test.ts`:
  - `does not use visible-cell legacy fallback when parser markers are present`
- `validateTemplate.test.ts`:
  - `rejects markered workbook when parser-critical fields are missing and only legacy cells are populated`

Result: preview is now the canonical parser-authority gate, with explicit and machine-checkable blocking behavior for markered parser-seam drift.
