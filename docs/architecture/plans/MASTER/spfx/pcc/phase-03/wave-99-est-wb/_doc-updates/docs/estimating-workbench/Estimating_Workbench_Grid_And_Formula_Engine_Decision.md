# Estimating Workbench Grid and Formula Engine Decision

## Closed Decision

MVP provides a grid-like estimating interface. It does **not** provide full Excel parity.

## Grid

- Candidate package: `@tanstack/react-table` with `@tanstack/react-virtual` after dependency gate.
- Required UX: row grouping, sort/filter, sticky header, column sizing, keyboard navigation, copy/paste from Excel into supported cells, bulk row actions, section-level validation banners.
- Required performance: virtualized rows for large line-item sets.

## Formula Behavior

- MVP supports simple arithmetic working formulas only where defined by template contract.
- Formula text may be stored as working metadata, but canonical downstream records store resolved values and lineage.
- Cross-sheet formulas, external workbook links, circular references, volatile functions, and unsupported formulas become static imported values or human-review items.
- HyperFormula is deferred because of GPLv3/proprietary license requirements. Do not install without legal/license approval.

## Unsupported Formula Handling

- `unsupported-formula-reference-only`
- `unsupported-formula-static-snapshot`
- `unsupported-formula-human-review`
- `unsupported-formula-retired`
