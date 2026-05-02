# 06 — Workbook Source Mapping Policy

## Workbook Role

The Buyout Log workbook is a source artifact. It is not the final UX contract.

It provides:

- source field inventory;
- project header metadata;
- seed buyout taxonomy;
- source formula hints;
- cost-code / CSI division context;
- historical workflow evidence.

## Required Extraction

Use `openpyxl` to extract:

- workbook filename;
- sheet names;
- used ranges;
- merged cells;
- frozen panes;
- hidden rows/columns;
- tables;
- named ranges;
- formulas;
- data validations;
- conditional formatting;
- protection/locked cells;
- project header fields;
- table header rows;
- all exact column headers;
- default line items;
- division/category rows;
- summary rows;
- formula-support rows;
- blank rows.

## Activation Policy

No workbook row becomes an active BuyoutPackage unless it is reviewed and activated.

Classification values:

```text
division-header
candidate-buyout-package
summary-row
formula-support-row
blank-row
excluded-template-row
ambiguous-review-row
```

## Field Survival

Every workbook column header must appear in `recordFields[]` of `default_buyout_log_seed_structure.json`.

## Formula Policy

Workbook formula hints must be translated into PCC calculated fields where applicable. Formula cells are not active records.
