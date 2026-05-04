# Dependency Package Evaluation — Estimating Workbench

## Purpose

Document existing and candidate dependency packages that can enhance or stabilize the Estimating Workbench implementation while preserving repo architecture and lockfile guardrails.

## Rule

This package does **not** authorize installation. It requires documenting and evaluating compatible dependencies so a later implementation prompt can make a deliberate package decision.

## Repo-Confirmed Existing Packages

- `@pnp/queryable` — already present in root devDependencies; supports future PnP ecosystem use.
- `@playwright/test` — already present; use for hosted/visual/end-to-end gates.
- `vitest` — already present; use for unit/contract tests.
- `@testing-library/react` — present in `apps/project-control-center`; use for component tests.
- `typescript`, `tsx`, `turbo`, `prettier` — already present and should be used for validation, tooling, and formatting.

## Candidate Packages To Document For Later Gated Use

| Package | Recommendation | Reason | Gate |
|---|---|---|---|
| `@pnp/sp` | Adopt after dependency gate | Fluent, type-safer SharePoint list/batch API; aligns with existing `@pnp/queryable` | Bundle/no-SLA/dependency review |
| `@tanstack/react-table` | Adopt after UI prototype gate | Headless TypeScript grid/table foundation | Must pair with virtualization |
| `@tanstack/react-virtual` | Adopt with TanStack Table | Required for large line-item grids | Scroll/focus/a11y testing |
| `@fluentui/react-components` | Use only through `@hbc/ui-kit` or after UI approval | M365-aligned components | Avoid duplicate design-system dependency |
| `zod` | Optional | Runtime command/form validation | Do not duplicate model contracts |
| `ajv` | Adopt for JSON artifact validation if JSON Schema is added | Strong JSON Schema validation/tooling | Dev/tooling first |
| `exceljs` | Adopt for export/tooling proof if needed | Excel generation and workbook management | Bundle/server-side review |
| `xlsx` | Evaluate for template migration tooling only | Workbook parsing for template migration | Security/staleness review |
| `hyperformula` | Defer | Formula engine useful but GPLv3/proprietary license gate | Legal/license approval required |
| `fast-check` | Adopt as devDependency if calculation/validation utilities are added | Property-based tests for invariants | Dev-only, seeded deterministic tests |

## Hard Block

Do not install HyperFormula, Handsontable, or any GPL/proprietary-license-sensitive spreadsheet package without explicit HB legal/license approval.
