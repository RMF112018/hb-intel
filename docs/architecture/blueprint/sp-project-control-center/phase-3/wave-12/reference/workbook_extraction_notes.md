# Workbook Extraction Notes (Wave 12)

Source workbook: `docs/reference/example/HB_ConstraintsLog_Template.xlsx`
Extraction posture: read-only inspection for taxonomy and traceability.

## Structural Notes

- Sheets: `ActionItems`, `Help`
- ActionItems range: `A1:K934`
- Header row: `10`
- Data validations: `4`
- Hidden rows: `810`
- Formula scan count: `795`

## Section Notes

- Core open/closed families are represented across permits, AHJ coordination, design development, utility providers, HB internal coordination, and construction progress.
- `7. {NEW SECTION} - OPEN` appears as template placeholders.
- `CHANGE TRACKING` and `Delay Log` are specialized sections and mapped as exposure source context.

## Interpretation Notes

- Workbook row content is not treated as active defaults.
- Sample rows remain examples unless project-specific verification exists.
- Ambiguities are documented in seed-structure JSON (`ambiguousItems`).

## Prompt 05 Constraint

No workbook modification, no runtime source changes, and no external-system behavior changes.
