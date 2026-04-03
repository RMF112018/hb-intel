# Prompt-02 — App-Binding Architecture and Resolution Model

## Objective

Create the architecture slice for first-class app-binding / backend-setup configuration so the repo has one clear reference for:
- what the binding record is,
- where it lives,
- who writes it,
- who reads it,
- how target apps resolve it before first backend-dependent use,
- and how this slice stays compatible with later Phase 10 configuration governance.

## Important execution rules

- Use Prompt-01 as the immediate controlling input.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Keep this architecture slice narrow and implementation-driving.
- Do not rewrite the entire Admin control-plane doctrine.

## Inputs

Use:
- the app-binding gap audit from Prompt-01
- the Admin end-state plan
- the Phase 6 architecture + contract docs
- current repo truth for target apps and shell runtime config

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-architecture.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-resolution-lifecycle.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-repair-and-drift-policy.md`

## Required architecture topics

### In the architecture doc
Cover:
- purpose of the app-binding slice
- operator-console responsibilities
- backend/control-plane responsibilities
- target-app responsibilities
- where the source of truth lives
- why the binding source must be resolvable before backend calls
- why package-time injection alone is insufficient as a first-class operator workflow
- how this slice is compatible with later Phase 10 config governance without requiring it now

### In the resolution lifecycle doc
Define the lifecycle for:
- create binding
- publish binding
- resolve binding in target app startup/runtime
- verify binding
- detect drift
- repair/reapply binding
- retire/replace binding

For each stage define:
- owner layer
- inputs
- outputs
- audit expectations
- failure behavior

### In the repair and drift policy doc
Define:
- what counts as binding drift
- what can be auto-repaired vs operator-confirmed
- repair/reapply semantics
- evidence/audit expectations
- explicit anti-patterns

## Required architecture constraints

Make these explicit unless repo truth forces correction:
- SPFx target apps may consume binding state but do not own the authoritative write path.
- The Admin control plane owns publication, mutation, audit, and repair initiation.
- The binding source must avoid circular dependency with `functionAppUrl` resolution.
- The slice should not depend on routine `.sppkg` rebuilds for normal operator changes.
- The slice should remain small enough to slot under later Phase 10 governance.

## Validation

Before finishing:
- cross-check against Prompt-01 findings,
- verify no contradiction with the end-state plan,
- keep the documents concrete enough to drive Prompts 03–09.

## Completion condition

Stop after the three architecture docs are complete and cross-linked.
Do not implement shared contracts or code in this prompt.
