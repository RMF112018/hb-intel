# Phase 5 — Admin Exception-Path Integration — Implementation Plan

## Objective

Integrate the Admin exception path into the Project Setup workflow so failed, escalated, or otherwise exceptional provisioning cases move into Admin in a controlled, auditable, and production-appropriate way.

This phase is not about broad workflow redesign. It is about ensuring exception ownership, routing, and recovery posture are operationally correct against the live repo.

## Scope

### In scope

- cross-app routing from Accounting into Admin for failed requests
- context handoff for failed or escalated provisioning cases
- Admin recovery action boundary hardening
- authorization and role-boundary verification for true Admin-only actions
- escalation / reopen / retry lifecycle integration
- Accounting / Admin operator UX for exception handling
- adjacent Estimating exception-path touchpoints where they materially affect Admin ownership
- exception-path documentation reconciliation
- readiness reporting for the exception workflow

### Out of scope

- changing core business lifecycle semantics established in earlier phases
- broad frontend redesign outside the exception path
- broad requester-surface redesign
- SharePoint provisioning step redesign except where needed to support coherent exception handling
- environment or tenant rollout work

## Why this phase matters

By the time a request reaches an exception state, the workflow is at its most operationally sensitive.

At that point:

- Accounting needs to stop short of recovery ownership
- Admin needs enough context to act without reconstructing the case manually
- request lifecycle and provisioning status must not drift apart
- retries, reopens, escalations, and overrides must be explicit and bounded
- cross-app navigation and messaging must reinforce the correct operator model
- shared retry/escalation behavior must be classified correctly instead of mislabeled as purely Admin-only

Without this phase, the workflow may look functional but remain unsafe under real failure conditions.

## Repo-truth baseline that shapes this phase

The live repo currently shows all of the following:

- Accounting “Send to Admin” is a navigation handoff that passes only `?projectId=`.
- Admin route-in currently uses `?projectId=` to auto-open a matching provisioning run.
- Durable provisioning runs are stored per run, not as one global overwritten project row.
- Estimating still contains bounded retry and escalation-to-Admin behavior.
- Some backend exception routes are broader than a simplistic Admin-only summary would imply.
- Saga/timer paths reconcile request state at key execution boundaries, but some Admin-side status actions need explicit drift checks.

Those facts make Phase 5 a **precision and boundary phase**, not just a route-wiring phase.

## Required repo areas

Expected focus areas include, as applicable:

```text
apps/accounting/src/*
apps/admin/src/*
apps/estimating/src/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/*
backend/functions/src/middleware/*
backend/functions/src/services/*
backend/functions/src/state-machine.ts
packages/provisioning/src/*
docs/architecture/reviews/*
docs/reference/spfx-surfaces/*
docs/reference/provisioning/*
docs/maintenance/*
docs/architecture/blueprint/current-state-map.md
```

## Implementation sequence

### Stage 1 — Repo-truth Admin exception-path audit

Prompt-01 establishes the current implementation truth for:

- failed request routing from Accounting
- Admin entry points for recovery
- Estimating exception-path touchpoints that materially intersect Admin
- available Admin actions
- authorization model for exception actions
- request/provisioning status behavior during recovery
- docs versus implementation truth

**Primary output**
- authoritative audit report for the current exception path

### Stage 2 — Cross-app failure routing and context handoff

Prompt-02 hardens or completes the handoff from Accounting to Admin so failed or escalated requests arrive with sufficient context.

It must explicitly answer whether `projectId` alone is a safe route-in contract in a multi-run durable model.

**Primary output**
- stable routing and context-handoff contract between Accounting and Admin

### Stage 3 — Admin recovery action boundary and authorization hardening

Prompt-03 verifies which recovery actions are truly Admin-exclusive and ensures the backend authorization posture matches the intended boundary.

It must explicitly distinguish Admin-exclusive recovery from shared retry/escalation behavior.

**Primary output**
- explicit Admin recovery boundary with verified role enforcement

### Stage 4 — Escalation ownership and reopen lifecycle integration

Prompt-04 aligns:

- escalation ownership
- reopen behavior
- retry behavior
- request/provisioning status consistency during recovery
- post-action request/status drift handling

**Primary output**
- coherent exception lifecycle behavior across request and provisioning domains

### Stage 5 — Operator UX and operational verification

Prompt-05 verifies Accounting/Admin messaging, action visibility, and operational flow for exception cases.

It should also verify adjacent ownership cues where Estimating still intersects the exception path.

**Primary output**
- operator-safe exception path UX with correct ownership cues

### Stage 6 — Documentation reconciliation and closure

Prompt-06 reconciles active docs and produces the final Phase 5 readiness report.

**Primary output**
- final exception-path implementation record and go-forward guidance

## Success criteria

- Accounting routes exceptional cases to Admin correctly
- Admin receives enough context to recover safely
- true Admin-only actions are clearly bounded and authorized
- shared retry/escalation behavior is explicitly classified
- reopen / retry / escalation behavior is coherent
- request state and provisioning status remain aligned during exception handling
- operator-facing messaging reflects correct ownership
- docs match repo truth

## Risks to watch

- `projectId`-only deep links selecting the wrong provisioning run
- Admin-only language applied to shared retry/escalation behavior
- backend route authorization being broader or narrower than UI assumptions
- request lifecycle and provisioning status drifting apart after Admin actions
- operator messaging implying the wrong surface owns the next step
- documentation overclaiming boundary maturity

## Reporting expectations

Every prompt should leave behind:

- repo-truth findings
- files changed
- rationale for material decisions
- unresolved issues
- follow-on recommendations, if any

The final closure report must clearly state whether Phase 5 is:

- complete
- substantially complete with residual risks
- blocked
