# Workbook Extraction Notes

## Scope

Live extraction notes for:

- `docs/reference/example/Responsibility Matrix - Template.xlsx`
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx`

## Observed Structure

### Responsibility Matrix - Template.xlsx

- Sheets: `PM`, `Field`
- PM used range: `A1:I86`
- Field used range: `A1:H78`
- PM header row: `3`
- Field header row: `7`

### Responsibility Matrix - Owner Contract Template.xlsx

- Sheet: `Template`
- Used range: `A1:F45`
- Placeholder schema rows observed in source scaffold region.

## Count Facts

- PM task-text candidates: `82`
- Field rows with assignment marks: `27`
- Workbook-derived task-row context: `109`
- Strict marked assignment rows: `98` (`71` PM + `27` Field)
- Owner-contract active default obligations: `0`

## Ambiguity Notes

- PM contains task-text rows without explicit marks; these remain review-required.
- Owner-contract placeholder rows remain non-active and are tracked as schema/ambiguous context.

## Normalization Notes

- Explicit RACI conversion is only applied for direct `R/A/C/I` marks.
- `X`, `Support`, `Review`, `Sign-Off` are preserved as source marks and normalized to unresolved (`Unknown`) pending policy review.

## ID Convention

- Active defaults:
  - `RM-PM-####`
  - `RM-FLD-####`
- Placeholder/ambiguous only:
  - `RM-OC-PLACEHOLDER-####`

## Guardrails

- No legal advice.
- No automatic legal-obligation creation.
- No runtime or external mutation semantics introduced by this extraction.
