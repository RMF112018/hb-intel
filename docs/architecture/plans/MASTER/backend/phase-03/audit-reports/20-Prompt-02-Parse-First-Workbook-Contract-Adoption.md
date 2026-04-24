# 20 — Prompt 02 Parse-First Workbook Contract Adoption

Date: 2026-04-24

## Scope
Implemented parser-authoritative Safety preview/ingestion hardening so markered templates fail closed on parser-contract drift, parser-critical Excel errors, and reporting-week inconsistency.

## Before vs After

| Area | Before | After |
|---|---|---|
| Parser-critical error cells | Parser seams could carry formula-error literals into metadata paths and downstream checks indirectly. | Parser-critical seams explicitly detect Excel errors (`#NAME?`, `#VALUE!`, `#REF!`, etc.), record field/source context, and block markered templates with explicit diagnostics. |
| Markered authority enforcement | Parser-first precedence existed, but reporting-period fields and parser-cell-error handling were not fully enforced as blocking authority checks. | Markered templates require parser-authoritative critical fields (`inspectionDate`, `inspectionNumber`, `projectSite`, `keyFindings`) and reporting fields when present; violations block commit readiness. |
| Key findings seam | ParserMeta and named-range precedence existed, but parser error values could remain ambiguous in diagnostics. | Key findings parser seams reject Excel error values, emit `PARSER_CRITICAL_CELL_ERROR`, and do not treat those values as normalized key findings. |
| Reporting week governance | Week checks relied on selected period range match only. | Backend now derives Monday-Friday week from authoritative inspection date and blocks markered template mismatches with `REPORTING_WEEK_MISMATCH` / `REPORTING_WEEK_INCOMPLETE`. |
| Failure classification | New parser/week blocking codes were not mapped into summary classing. | Failure classifier maps `PARSER_CRITICAL_CELL_ERROR` -> `parser-authority-violation` and week diagnostics -> `reporting-period-mismatch`. |

## Canonical Authority Contract
- Markered templates (`SafetyChecklist_v1` + `parse-first-2026-04`): parser-derived critical values are authoritative. Operator context is advisory only and cannot override parser-authoritative fields.
- Markerless templates: legacy/context fallback remains available.

## Sample Preview Evidence
Sample preview JSON generated from uploaded workbook template using backend preview evaluator and a fixture Graph repository:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/backend/phase-03/audit-reports/20-Prompt-02-Preview-Sample.json`

Observed blocking diagnostics in sample:
- `TEMPLATE_VALIDATION_FAILED`
- `TEMPLATE_INCOMPATIBLE`
- `PARSER_CRITICAL_CELL_ERROR` (`keyFindings` from parser-meta = `#NAME?`)
- `PARSER_AUTHORITY_VIOLATION` (projectSite/keyFindings unresolved authority)
- `REPORTING_WEEK_MISMATCH` (workbook Sunday-Thursday vs backend Monday-Friday derivation)
- `REPORTING_PERIOD_MISMATCH`

Observed warnings in sample:
- `INSPECTION_DATE_CONTEXT_MISMATCH`
- `INSPECTION_NUMBER_CONTEXT_MISMATCH`

This confirms parser values remain authoritative on markered templates and operator-entered context does not override them.

## Files Changed
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/domain/types.ts`
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/parser/contractWorkbookAccess.ts`
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/parser/extractMetadata.ts`
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/parser/validateTemplate.ts`
- `/Users/bobbyfetting/hb-intel/packages/features/safety/src/ingestion/weekRangeForDate.ts`
- `/Users/bobbyfetting/hb-intel/backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `/Users/bobbyfetting/hb-intel/backend/functions/src/services/safety-ingestion-failure-classifier.ts`
- test updates in parser + backend preview/failure-classifier suites

## Verification Commands and Results

1. `pnpm --filter @hbc/features-safety check-types`  
Result: pass

2. `pnpm --filter @hbc/features-safety test -- src/parser/validateTemplate.test.ts src/parser/extractMetadata.test.ts src/parser/parseChecklist.test.ts src/parser/xlsxWorkbookView.test.ts src/ingestion/weekRangeForDate.test.ts src/ingestion/runIngestionPipeline.test.ts`  
Result: pass

3. `pnpm --filter @hbc/functions check-types`  
Result: pass

4. `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-preview-evaluator.test.ts src/services/__tests__/safety-ingestion-application-service.test.ts src/services/__tests__/safety-ingestion-failure-classifier.test.ts`  
Result: pass

5. Sample artifact generation:  
`pnpm exec tsx /tmp/prompt02-preview-sample.ts`  
Result: pass, wrote `20-Prompt-02-Preview-Sample.json`

## Versioning
Safety manifest already present and aligned at `1.2.27.0` in `/Users/bobbyfetting/hb-intel/apps/safety/config/package-solution.json` (`solution.version` and `features[0].version`), matching this prompt's target increment.
