# 06 — Workbook Source Mapping Policy

## Workbook Role

The workbook `docs/reference/example/07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx` is a source artifact. It is not the final UX contract.

It provides:

- source field inventory;
- project identification fields;
- project classification fields;
- seed lesson taxonomy;
- seed impact magnitude guide;
- sample database-row shape;
- baseline review/approval fields;
- writing standards and category definitions.

## Required Extraction

Use `openpyxl` in the local repo to extract:

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
- lesson block fields;
- database headers;
- reference guide categories;
- impact magnitude thresholds;
- writing standards;
- approval fields;
- default/sample rows;
- summary/formula rows;
- blank rows.

## Field Survival

Every source workbook field must appear in `reference/workbook_field_mapping_reference.json` as one of:

- `recordField`
- `classificationField`
- `impactField`
- `evidenceField`
- `reviewField`
- `approvalField`
- `taxonomySeed`
- `metricSeed`
- `legacySourceOnly`

## Activation Policy

No workbook row becomes an active `PccLessonLearnedRecord` unless a future import workflow explicitly activates it.

Classification values:

```text
project-header-field
project-classification-field
lesson-entry-field
project-summary-rating-field
best-practice-field
process-improvement-field
approval-field
reference-taxonomy-row
impact-guide-row
writing-standard-row
sample-database-row
summary-formula-row
blank-row
ambiguous-review-row
```

## Formula Policy

Workbook formulas are source hints only. They must be translated into named metric definitions or validation rules if retained. Formula cells are not active records.

## UX Policy

Do not reproduce:

- the static six-lesson limit;
- the manual copy/paste database workflow;
- spreadsheet-like entry grid as the primary UX;
- closeout-only assumption.

Preserve:

- categories;
- impact magnitudes;
- core lesson structure;
- review/approval concept;
- best-practice and process-improvement concept;
- writing standards.
