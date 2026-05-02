# Wave 13 Workbook Source Mapping

Date: 2026-05-02
Wave: 13
Module: `Buyout Log` (`Buyout Control Center`)

## Binding Workbook Truth (Prompt 01)

- source workbook: `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`
- sheet: `Sheet1`
- used range: `A1:N88`
- header row: `6`
- candidate buyout rows: `8–85`
- summary rows: `86–88`
- hidden rows/columns: none
- data validations: none
- conditional formatting: none
- defined names: none

## Column Header Survival Rule

All workbook headers from row 6 are preserved in `recordFields[]` in `reference/default_buyout_log_seed_structure.json`:

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

## Row-Band Classification Contract

- Rows `1–5`: workbook title/project header context; non-active source metadata only.
- Row `6`: table header; schema source only.
- Rows `8–85`: candidate buyout package seed rows with exact `sourceRow` references in `defaultBuyoutLineItems[]`.
- Rows `86–88`: summary/formula rows; non-active by rule.

Template/header/summary/formula-support/blank rows are source taxonomy only unless explicitly activated by a governed import/activation flow.

## Formula and Source-Calculation Posture

`summaryAndFormulaRows[]` and row mapping notes preserve workbook formula posture:

- `E7:E85 = C{r}-D{r}`
- `J8:J85 = B{r}`
- `J86 = B86`
- `C86 = SUM(C7:C85)`
- `D86 = SUM(D8:D85)`
- `E86 = SUM(E7:E85)`
- `D87 = C87`
- `C88 = C86/C87`
- `E88 = E86-E87`

## Non-Inference Guardrail

Do not infer requiredness, dropdown options, validations, or conditional business rules from workbook formatting alone.

Prompt 01 confirms: no data validations, no conditional formatting, no hidden rows/columns, and no defined names.
