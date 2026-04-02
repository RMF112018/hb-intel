# Prompt-01 — Phase 6 Prerequisite Audit and Compatibility Plan

## Objective

Audit the live repo and determine what prerequisite substrate for **Phase 6 — In-app backend install and bootstrap** already exists, what is missing, and what minimum compatibility scaffolding must be added so Phase 6 can be implemented cleanly without back-dooring an uncontrolled rewrite of Phases 2–5.

## Important execution rules

- Read the smallest authoritative set needed.
- Do **not** re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.
- Treat live repo truth as authoritative over historical assumptions.
- This prompt is an audit-and-plan prompt, not the main implementation prompt.

## Governing direction

Use the attached end-state plan as the destination reference for:
- setup/install workflow UX
- validation and preflight UX
- in-app backend install/bootstrap initiation
- approval-aware checkpoints where unavoidable
- post-install verification
- SPFx operator console vs backend privileged executor boundary

## Required authority set to inspect first

At minimum inspect:

### Docs
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- any existing `docs/architecture/plans/MASTER/spfx/admin/**` phase docs if present
- `docs/architecture/blueprint/current-state-map.md` only if needed for present-truth confirmation

### Frontend
- `apps/admin/src/App.tsx`
- `apps/admin/src/router/root-route.tsx`
- `apps/admin/src/router/routes.ts`
- `apps/admin/src/pages/**`

### Backend
- `backend/functions/README.md`
- `backend/functions/src/functions/**`
- `backend/functions/src/services/service-factory.ts`
- existing provisioning-related services, persistence services, signalR/proxy/admin entry points, and any existing function endpoints that are reusable for install/bootstrap

### Shared packages
- the current shared model package(s) that own provisioning/admin run types, if any
- `packages/features/admin/**`
- `@hbc/ui-kit` or `@hbc/shell` only if needed to validate Admin shell reuse or route fit

## Required output

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-phase-6-prerequisite-audit.md`

## The audit file must contain

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo facts relevant to Phase 6**
4. **What Phase 6-capable substrate already exists**
5. **What is missing**
6. **Which missing items are true blockers vs can be handled by minimal compatibility scaffolding**
7. **Recommended compatibility strategy**
8. **Explicit non-goals**
9. **Recommended execution sequence for the remaining Phase 6 prompts**

## Minimum facts to confirm if still true

- Admin docs under `docs/architecture/plans/MASTER/spfx/admin/` are still extremely thin.
- Current Admin app navigation is still limited and does not yet expose a real setup/install lane.
- Current backend foundations are strong enough to reuse for orchestration, adapter execution, persistence, and progress reporting.
- `@hbc/features-admin` remains an admin-intelligence package and is not the install control plane.
- Production backend posture already assumes managed identity + environment-driven configuration.
- There is no finished Phase 6 install/bootstrap flow yet.

## Compatibility rule

If Phases 2–5 substrate is partially absent, define the **smallest forward-compatible slice** Phase 6 must introduce, but do not turn this into a full reimplementation of all earlier phases.

## Validation

Before finishing:
- verify every referenced path exists,
- distinguish confirmed fact from inference,
- ensure the document tells later prompts exactly where to stay narrow.

## Completion condition

Stop after the prerequisite audit is complete and coherent.
Do not start implementing install architecture or code in this prompt.
