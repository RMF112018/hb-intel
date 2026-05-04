# Estimating Workbench Grid and Formula Engine Decision
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

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
