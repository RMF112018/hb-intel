# 02-Checklist-Contract-and-Parser-Assessment

## Overall Assessment

The parser foundation is one of the stronger parts of the implementation. The `templateContract.ts`, `validateTemplate.ts`, `parseChecklist.ts`, `extractMetadata.ts`, and scoring layer are internally coherent for `template-compat-v1`.

However, the parser is **not yet proven deployable for governed real-world `.xlsx` ingestion** because the tests are synthetic and the date/validation paths remain too thin for a production upload-first workflow.

## Seams Inspected

- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/parser/workbookView.ts`
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/parseChecklist.ts`
- `packages/features/safety/src/scoring/scoringEngine.ts`
- `packages/features/safety/src/scoring/findingExtraction.ts`
- `packages/features/safety/src/scoring/duplicateKey.ts`
- `packages/features/safety/src/test/fixtures.ts`

## What is Good

### Checklist contract
`templateContract.ts` is detailed and useful:

- 12 sections are explicitly modeled.
- displayed rows and compat-count rows are separated.
- the documented exclusion rows are encoded directly.
- weights and section rationales are explicit.
- item labels are anchored to exact row numbers.

That is strong governed-contract design for Release 1.

### Template validation
`validateTemplate.ts` does enforce meaningful minimum contract checks:

- required sheet presence
- anchor label checks for core cells
- response-matrix header checks
- scoring weights shape check
- section-header drift warnings

### Parsing behavior
`parseChecklist.ts` correctly:

- reads row responses from the Yes / No / N/A matrix
- classifies `yes`, `no`, `na`, `incomplete`, and `multi`
- preserves notes
- preserves workbook score/flag cells
- returns parser/template metadata plus full row evidence

### Scoring behavior
`computeInspectionScore()` correctly implements compat-mode semantics:

- uses `compatCountRows` only for section scoring
- still counts excluded displayed rows in overall raw totals
- throws on `normalized-vNext`, which is the correct current Release 1 posture

### Finding extraction
`extractFindings()` is coherent and intentionally simple:

- `no-response` drives severity from section weight
- `incomplete` and `multi` produce medium severity
- `note-only` is preserved as informational evidence

## What is Weak

### Validation is still too thin for governed workbook drift
The validation layer does **not** currently prove:

- formula integrity
- summary-cell arithmetic integrity
- exact scoring-weight values from the workbook
- template version cell handling
- workbook shape beyond a few anchor and header checks
- whether the real uploaded workbook preserves the expected cell types

This is acceptable for a first parser spike, but thin for a governed operational workflow.

### Real `.xlsx` path is not meaningfully verified
The code supports SheetJS-based `.xlsx` ingestion via `xlsxWorkbookView.ts`, but the test posture does not prove:

- actual workbook file open/parse against a governed fixture file
- date-cell behavior from real Excel serials / locale formats
- hidden formatting or sheet drift issues
- malformed-but-openable workbook behavior

### Date normalization is risky
Two specific date paths are fragile:

1. `xlsxWorkbookView.ts` converts Date-valued cells with `toISOString().slice(0, 10)`.
2. `extractMetadata.ts` falls back to `Date.parse(raw)` and then `toISOString().slice(0, 10)`.

That creates risk for:

- locale-formatted workbook dates
- timezone-induced day shifts
- duplicate-key misses
- wrong reporting-week calculation

### Parse failure semantics are collapsed
`runIngestionPipeline.ts` records parser exceptions with:

- `parseStatus: 'failed'`
- `errorClass: 'parse-error'`
- **but** `terminalStatus: 'invalid-template'`

That weakens operational diagnosis. A malformed template and a parser/data anomaly are not the same thing.

## Conclusion

### Contract quality
Good for Release 1 compat-mode scoring.

### Production ingest deployability
Not yet proven.

## Required Remediation Direction

1. Add real `.xlsx` fixture-driven tests around `xlsxWorkbookView.ts`.
2. Harden date normalization to be workbook-format aware and timezone-safe.
3. Add stronger workbook validation for score/weight/version drift.
4. Split parser/data anomalies from true invalid-template terminal handling.
