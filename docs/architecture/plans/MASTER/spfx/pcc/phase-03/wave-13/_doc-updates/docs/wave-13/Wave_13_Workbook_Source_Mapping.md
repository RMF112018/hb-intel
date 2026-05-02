# Wave 13 — Workbook Source Mapping

## Workbook Path

Expected repo path:

```text
docs/reference/example/financial/Buyout Log_Template 2025.xlsx
```

## Required Column Survival

Every workbook column must survive as a record field:

- `DIVISION # / DESCRIPTION`
- `SUBCONTRACTOR / VENDOR`
- `CONTRACT AMOUNT`
- `ORIGINAL BUDGET`
- `OVER/UNDER`
- `LOI DATE TO BE SENT`
- `LOI Returned Executed`
- `Submittal Dates`
- `Lead Times`
- `Sub Name`
- `BALL IN COURT`
- `Enrolled in SDI [Yes/No]`
- `Bond Required [Yes/No]`
- `COMMENTS`

## Mapping Rule

The workbook is not the UX. It is a source reference and seed taxonomy.

## Activation Rule

Only rows classified as `candidate-buyout-package` may become active `BuyoutPackage` records. Title, project header, table header, division header, summary, formula-support, and blank rows must not become active records.
