# 06 — Workbook Source Mapping Policy

Generated: 2026-05-03

## Source Workbook

`docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`

## Workbook Role

The workbook is a source field inventory, scoring seed, and taxonomy reference. It is not the target UX and not the target persistence model.

## Sheet Roles

| Sheet | Target Role |
|---|---|
| `Scorecard` | Primary source for project metadata fields, score criteria, category weights, narrative fields, recommendation field, and approval fields. |
| `Aggregation Dashboard` | Sample reporting structure and example rows only; not active production data. |

## Field Survival Rule

Every workbook field must survive as exactly one of:

- target persisted field;
- calculated field;
- source-lineage field;
- evidence-link field;
- display-only derived field;
- deprecated/source-only field with explicit reason.

No workbook field may be dropped silently.

## Scoring Formula Conversion

Workbook formulas become governed PCC calculation rules:

- workbook factor scores remain 1-5;
- workbook category weights are frozen as v1 defaults;
- workbook weighted score formulas become deterministic TypeScript calculation tests in future implementation;
- workbook rating bands become `rating_bands` in the module data contract;
- workbook `Recommend rebidding` language is replaced by `futureWorkRecommendation` values.

## Sample Data Rule

Rows in `Aggregation Dashboard` are example/demo rows and are not active seed records unless Bobby separately approves sample fixture creation. They may be used to create deterministic mock fixtures only when clearly labeled as mock/demo.
