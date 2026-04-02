# Prompt-08 — SPFx Unified Observability Console and Routes

## Objective

Implement the real SPFx operator-console surfaces for Phase 12 observability and correct any placeholder/deferred routing that currently prevents trustworthy admin visibility.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Reuse `@hbc/ui-kit`, `@hbc/features-admin`, and the new backend observability APIs.
- Keep SPFx focused on operator workflow, not persistence or privileged query logic.
- Do not leave placeholder routing in place where a real observability surface should now exist.

## Inputs

Use:
- `apps/admin/**`
- new backend observability APIs
- reusable hooks/components from `@hbc/features-admin`
- current route/page gaps identified in Prompt-01

## Scope of work

Implement or correct the operator-console surfaces needed for Phase 12, including at minimum:

- real error-log page
- alerts view
- health / summary view
- probe-state / recent-snapshot view
- correlated detail view or drilldown pattern for alert/error/run context
- operator actions for acknowledge / resolve / refresh where in scope
- route cleanup so `/error-log` and other observability routes no longer point to placeholder sections unless that is still intentionally correct and documented

## UX requirements

The new SPFx surfaces must:
- make severity and status obvious
- show time / source / scope / correlation context
- support common filtering without requiring client-side ad hoc joining of raw data
- clearly distinguish:
  - alerts
  - probe health
  - errors
  - historical evidence
- avoid pretending to offer control that the backend does not support

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-console-ux-map.md`

Include:
- route map
- page/component ownership
- major workflows
- empty / loading / error behavior
- explicit remaining gaps if any

## Validation

At minimum:
- route/page rendering tests
- hook/query state tests where appropriate
- targeted UI tests for filter/drilldown/action states
- compile/lint checks for touched app/package code

## Completion condition

Stop after the SPFx observability surfaces and route/UX map are complete.
Do not do final docs/release reconciliation in this prompt.
