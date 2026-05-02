# Workbook Source Analysis

Generated: 2026-05-02

## Scope

This analysis is based on uploaded and previously extracted workbooks:

```text
Responsibility Matrix - Template(3).xlsx
Responsibility Matrix - Owner Contract Template(3).xlsx
```

The local agent must verify these findings directly against repo-resident files:

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

## Product Direction

The workbooks are **source references**, not final product constraints.

The target architecture must preserve workbook traceability while moving beyond spreadsheet UX into a governed, item-level responsibility control system.

## Prior Extraction Summary

Prior extraction found:

| Workbook | Sheet posture | Default item posture |
|---|---|---|
| Responsibility Matrix - Template.xlsx | Active `PM` and `Field` sheets | 109 default responsibility items total |
| Responsibility Matrix - Owner Contract Template.xlsx | Template/party-code posture | 0 populated default obligation descriptions; 36 ambiguous placeholder rows |

## Default Item Counts

| Sheet | Default item count | Target interpretation |
|---|---:|---|
| PM | 82 | PM operations, contracts, notices, payment, financial, schedule, buyout, and administration responsibilities. |
| Field | 27 | Field operations, schedule, field workstreams, MEP, interiors, envelope, QAQC, and superintendent coordination responsibilities. |
| Owner Contract Template | 0 populated items | Template structure for owner-contract mapping and contract-party responsibility, not populated obligations. |

## Required Local Extraction Verification

The local agent must inspect both workbooks and confirm:

- workbook filename;
- sheet names;
- used ranges;
- merged cells;
- frozen panes;
- hidden rows/columns;
- Excel tables;
- named ranges;
- formulas;
- displayed/cached values;
- data validations/dropdowns;
- conditional formatting;
- workbook protection;
- header rows;
- section rows;
- item rows;
- categories / phases / workstreams;
- role columns;
- assignment marks/symbols;
- comments/notes/instructions;
- source row references;
- default item rows;
- ambiguous rows.

## Classification Policy

Each row must be classified as:

| Classification | Treatment |
|---|---|
| Responsibility item | Eligible for default item creation. |
| Section header | Preserve as grouping, not responsibility item. |
| Instruction row | Preserve in extraction notes. |
| Blank row | Ignore. |
| Formatting-only row | Ignore. |
| Placeholder row | Preserve as schema/pattern source only. |
| Ambiguous row | Include in ambiguous-items register; do not activate without review. |

## Field Meaning Classification

The local agent must not infer requiredness from blank/nonblank cells alone.

Classify meaning as:

- explicit workbook requirement;
- implied workbook usage;
- target-architecture recommendation;
- ambiguous / needs review.

## Target Source Mapping Requirements

Every workbook-derived item must preserve:

```text
sourceFile
sourceWorkbookType
sourceSheet
sourceRow
sourceSection
sourceCategory
sourceSubcategory
sourceItem
normalizedItem
sourceAssignments
sourceRole
sourceMark
normalizedRole
normalizedRaciValue
recommendedTargetClassification
requiresUserReview
mappingNotes
```

## Owner-Contract Template Rule

Because the owner-contract workbook appears to contain placeholder/template rows rather than populated obligation descriptions, it must be documented as:

- source of contract-party mapping posture;
- source of party-code/contract responsibility structure;
- source of default fields and mapping workflow;
- not a source of 36 active default contract obligations unless local workbook verification proves otherwise.

## Required JSON

The local agent must create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json
```

It must be generated from workbook extraction or verified against the package-provided reference JSON, not guessed manually.
