# P1-F1-T08: Downstream Consumer Boundary, Publication Model, and Phase 3 Reconciliation

## 1. Downstream Consumer Boundary

The governing downstream boundary is:

- connector runtime stays in backend/platform and governed data-access seams,
- downstream consumers read published HB Intel views or governed repositories,
- query-hooks remain the preferred consumption boundary for app-layer query usage,
- feature packages and PWA source modules do not call connectors directly.

## 2. Allowed Downstream Consumption Paths

Allowed:

- published read models surfaced through governed repositories,
- query-hooks over governed repositories,
- feature packages consuming read models or published projections,
- Project Hub modules consuming connector-backed published views during transition.

Not allowed by default:

- direct connector calls from `apps/pwa/src/sources/**`,
- direct connector logic inside feature packages,
- bypassing `@hbc/data-access` and `@hbc/query-hooks` for connector-backed data consumption.

## 3. Publication Model

Published operational read models exist to:

- stabilize downstream consumption,
- decouple feature packages from source-specific transport details,
- allow transitional SharePoint-hosted operational views where needed,
- let the integration runtime evolve without reworking every downstream consumer.

## 4. Phase 3 Planning Assumptions That Now Need Revision

Phase 3 planning must later be reconciled to this boundary so that:

- connector-backed source data is treated as published HB Intel views, not direct feature-package integrations,
- module source-of-truth language reflects the integration publication boundary,
- Project Hub financial, schedule, and constraints modules remain consumers of published views rather than connector runtimes.

## 5. Required Phase 3 Follow-On Updates

The following docs require later follow-on reconciliation:

- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-Financial-Module-Field-Specification.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-T02-Budget-Line-Identity-and-Import.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-T08-Platform-Integration-and-Annotation-Scope.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E5-Schedule-Module-Field-Specification.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E6-Constraints-Module-Field-Specification.md`

## 6. Project Hub During Transition

Project Hub modules should treat connector-backed data during transition as:

- imported or published HB Intel views,
- governed read models,
- reconciliation-aware but still downstream consumption surfaces.

They should not become ad hoc connector clients.

## 7. Required Current-Seam Changes Reinforced Here

To preserve this boundary, future implementation must:

- add a durable project registry and identity/mapping path,
- wire proxy context at startup if proxy remains the governed access path,
- reconcile proxy/backend routes,
- replace PWA mock domain query providers with published read-model providers,
- preserve the separation between runtime integration and downstream consumption.
