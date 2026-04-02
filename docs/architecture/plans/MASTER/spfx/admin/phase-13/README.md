# README — Admin SPFx IT Control Center Phase 12 Prompt Package

## What this package contains

This package is a **local-code-agent implementation set** for **Phase 12 — Admin intelligence completion and unified observability** of the Admin SPFx IT Control Center effort.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-12-Summary-Plan.md`
2. `Prompt-01-Phase-12-Repo-Truth-Observability-Audit-and-Gap-Map.md`
3. `Prompt-02-Phase-12-Observability-Baseline-and-Persistence-Model.md`
4. `Prompt-03-Shared-Observability-Contracts-and-Models.md`
5. `Prompt-04-Durable-Persistence-Adapters-and-Storage-Plumbing.md`
6. `Prompt-05-Backend-Observability-APIs-and-Telemetry-Normalization.md`
7. `Prompt-06-Probe-Execution-and-Alert-Evaluation-Productionization.md`
8. `Prompt-07-Cross-Domain-Instrumentation-and-Correlation-Adoption.md`
9. `Prompt-08-SPFx-Unified-Observability-Console-and-Routes.md`
10. `Prompt-09-Notification-Dispatch-and-Operator-Action-Workflows.md`
11. `Prompt-10-Testing-Docs-Runbooks-and-Config-Guidance.md`
12. `Prompt-11-Phase-12-Exit-Reconciliation-and-Release-Readiness.md`

## Intended execution order

Run the prompt files in numeric order.

Do **not** skip ahead unless a prompt explicitly tells the agent to stop because repo truth materially differs from the assumptions captured here.

## How the local code agent should use these prompts

- Treat the governing end-state plan as the intended destination for Phase 12.
- Treat verified live repo state as implementation truth.
- Read only the **smallest authoritative set** needed for the current prompt.
- Do **not** re-read files that are still in active context or memory unless:
  - the prompt explicitly requires a fresh check,
  - the file changed,
  - the context became stale,
  - or the task widened.
- Keep Phase 12 architecture-safe:
  - SPFx is the operator console.
  - Backend/control plane owns durable execution and persistence.
  - `@hbc/features-admin` remains the reusable admin-intelligence layer, not the privileged control plane.

## Required authority order

Use this order when signals disagree:

1. verified live code and configuration
2. `docs/architecture/blueprint/current-state-map.md`
3. the governing end-state plan
4. relevant package/app README and tests
5. the new Phase 12 observability docs created in this sequence
6. older phase/task plans

## Execution cautions

- This package is for **Phase 12 only**.
- Do not turn observability work into a broad admin-platform rewrite.
- Do not keep durable alert/probe/error state in browser memory.
- Do not push persistence or privileged query logic into SPFx.
- Do not leave placeholder routing in place if the route is supposed to serve a real observability page.
- Do not “paper over” missing durability with better UI only.
- Do not update `current-state-map.md` with target-state claims.

## Expected repository outputs from executing this package

Expected outputs will likely touch:

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/**`
- local README updates where observability behavior materially changes

### Shared models / package code
- `packages/models/**`
- `packages/features/admin/**`

### Backend/control-plane code
- `backend/functions/**`

### SPFx operator-console code
- `apps/admin/**`

## Validation posture

Use the smallest meaningful validation set per prompt, but expect real code validation in this phase because the work is not docs-only.

Typical expectation:
- targeted unit tests for new models, hooks, adapters, and query logic
- integration tests for backend APIs / persistence behavior where available
- route / page rendering tests for SPFx observability surfaces
- targeted formatting / linting / test commands for touched workspaces

Do **not** run the full monorepo by default unless the touched areas or repo tooling require it.

## Completion standard

The package is complete when the repo has:
- a real durable observability baseline,
- durable alert and probe state,
- production-grade admin observability APIs,
- non-placeholder SPFx observability surfaces,
- and a clear Phase 12 exit report with residual risks and next-phase entry guidance.
