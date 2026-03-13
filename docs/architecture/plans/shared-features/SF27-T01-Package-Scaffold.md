# SF27-T01 - Package Scaffold: `@hbc/bulk-actions`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-01, L-02, L-03, L-08, L-09
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF27 master plan

> **Doc Classification:** Canonical Normative Plan - SF27-T01 scaffold task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define scaffolding across `@hbc/bulk-actions` and `@hbc/ui-kit` with runtime/testing exports, selection/execution seams, and README requirements that match current package-governance rules.

---

## Required Files

```text
packages/bulk-actions/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/model/index.ts
|- src/selection/index.ts
|- src/execution/index.ts
|- src/adapters/index.ts
|- src/hooks/index.ts
|- src/telemetry/index.ts
|- testing/index.ts

packages/ui-kit/src/BulkSelectionBar/
packages/ui-kit/src/BulkActionMenu/
packages/ui-kit/src/BulkActionConfirmDialog/
packages/ui-kit/src/BulkActionInputDialog/
packages/ui-kit/src/BulkActionResultsPanel/
packages/ui-kit/src/SelectAllFilteredBanner/
```

Scaffold expectations must leave explicit room for:

- selection scope state
- filtered-set snapshot capture
- per-item eligibility state
- execution chunk planning
- grouped result summaries
- retryable failure handling
- selection-source adapters
- telemetry and testing exports

---

## Package Contract Requirements

- primitive package name is `@hbc/bulk-actions`
- consumers import primitive public exports only
- runtime/orchestration ownership remains in `@hbc/bulk-actions`
- reusable visual primitives and presentational components belong in `@hbc/ui-kit` per `CLAUDE.md`
- any local render helpers in `@hbc/bulk-actions` must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive check-types/build/test targets

---

## README Requirement (Mandatory in T01)

Must include:

1. shared bulk-actions overview
2. selection-scope vocabulary and safety boundary summary
3. immediate vs configured action model summary
4. eligibility, destructive-warning, and permission-gating contract summary
5. chunked execution and mixed-result reporting summary
6. current selection-source seams (`HbcDataTable`, `ListLayout`) and future seam posture
7. testing entrypoint guidance (`@hbc/bulk-actions/testing`)
8. links to SF27 master, SF27-T09, ADR-0114, and companion primitive ADR

---

## Export Expectations

Primitive exports must reserve public surface for:

- selection and execution contracts
- selection-source adapter contracts
- eligibility and result selectors
- confirm/input/results state selectors
- grouped reason helpers
- telemetry constants and testing factories

These exports are required so modules do not invent local bulk-processing behavior.

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions build
pnpm --filter @hbc/bulk-actions test --coverage
pnpm --filter @hbc/ui-kit check-types
```
