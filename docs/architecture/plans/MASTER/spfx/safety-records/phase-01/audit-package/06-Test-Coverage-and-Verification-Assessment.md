# 06-Test-Coverage-and-Verification-Assessment

## Overall Assessment

The current backend verification posture is **helpful but not production-credible**.

The repo does include a meaningful unit-test layer around the synthetic parser/scoring/state-machine core. But it does **not** prove the hosted SharePoint backend path.

## What is Proven

## Unit tests (23 total cases claimed by the package, consistent with repo-truth test files)

### Parser / contract
- `packages/features/safety/src/parser/validateTemplate.test.ts`
- `packages/features/safety/src/parser/parseChecklist.test.ts`

These prove:
- required-sheet detection
- response-header drift rejection
- metadata extraction from synthetic workbook cells
- response classification (`yes`, `no`, `na`, `incomplete`, `multi`)

### Scoring / findings
- `packages/features/safety/src/scoring/scoringEngine.test.ts`
- `packages/features/safety/src/scoring/findingExtraction.test.ts`
- `packages/features/safety/src/scoring/projectWeekRollup.test.ts`
- `packages/features/safety/src/scoring/duplicateKey.test.ts`

These prove:
- compat-mode exclusion rows
- weighted score math
- high/medium/info finding severity behavior
- weekly average function in isolation
- duplicate/business key normalization basics

### State-machine core
- `packages/features/safety/src/ingestion/runIngestionPipeline.test.ts`

This proves:
- happy path
- invalid-template terminal
- unresolved-project terminal
- high-confidence duplicate terminal
- commit-failed terminal

## What is Thin

### E2E coverage
- `e2e/domain-safety.spec.ts`
- `e2e/webparts/safety.spec.ts`

These are shell-render smoke tests, not backend-ingestion proofs.

## What is Missing

### 1. No real `.xlsx` ingestion verification
There is no repo-truth test proving that a governed Excel workbook file passes through:

- SheetJS read
- workbook wrapping
- date-cell normalization
- parser extraction
- scoring
- ingest pipeline

using an actual `.xlsx` fixture.

### 2. No SharePoint adapter verification
There is no proven test coverage for:

- upload to `/sites/Safety/SafetyChecklistUploads`
- writes to `/sites/HBCentral`
- cross-site endpoint composition
- lookup-field payload formation
- 403 / 404 / 409 / 500 handling
- partial write failure handling
- retry/replay behavior

### 3. No weekly rollup integration proof
The weekly averaging function is unit-tested, but the commit path that feeds it is not tested for multiple inspections across different dates in the same week.

### 4. No reporting-period correctness verification
No test proves that the workbook inspection date is checked against the selected reporting period.

### 5. No test for ingestion-run period filtering
The repository interface supports `reportingPeriodId` filtering on ingestion runs, but the run model does not store it and no tests exercise that mismatch.

### 6. No test for parser/date ambiguity
No tests cover:

- locale date strings
- timezone shifts
- Excel date serialization edge cases

## Misleading Coverage Risks

### Synthetic workbook coverage may overstate readiness
The synthetic workbook fixtures are useful, but they bypass many real Excel behaviors.

### State-machine coverage may overstate persistence readiness
The pipeline tests use a fake adapter. They do not prove that the real storage engine can honor the same contract.

## Conclusion

The current tests prove that the **in-memory logic** is partially sound. They do **not** prove that the hosted upload-first SharePoint backend is operationally safe.

## Required Remediation Direction

1. Add real `.xlsx` fixture tests.
2. Add SharePoint adapter tests or contract tests.
3. Add multi-date same-week rollup integration tests.
4. Add reporting-period validation tests.
5. Add tests for ingestion-run filtering and replay.
