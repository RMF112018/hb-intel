# Phase 3 — Accounting App Functional Completion — Implementation Plan

## Objective

Complete the Accounting SPFx app so it fully supports the controller role in the Project Setup workflow, aligned first to live repo truth, then to the current-state map and living reference docs, and only secondarily to older PH6-era planning material.

This phase remains **implementation-forward**, but it must not silently re-open lifecycle or ownership decisions that belong to earlier phases.

## Authority and Preconditions

Use the following authority order while executing this phase:

1. live Accounting/backend code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living refs for Controller review, Admin recovery, Coordinator visibility, current provisioning behavior, and Project Setup connected-service posture
4. PH6 and earlier MVP plans as historical drift evidence

Phase 3 assumes:

1. Phase 1 froze workflow and boundary intent well enough for implementation to proceed.
2. Phase 2 either preserved or explicitly changed lifecycle semantics; if it did not, current repo truth remains the starting point.
3. Accounting remains the controller-facing workflow surface.
4. Admin remains the recovery and override surface.
5. The UI should consume the current backend contract rather than invent a competing lifecycle model.

## Repo-Truth Baseline

Execute this phase against the current live baseline:

- queue tabs already expose `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, and `Failed`
- detail actions already expose approve, clarification, hold, and failed-item handoff to Admin
- current UI wording already reflects automatic provisioning start after approval to `ReadyToProvision`
- `AwaitingExternalSetup` still lacks a forward action in the current detail surface
- Admin recovery routes and actions already exist and must stay out of Accounting
- Accounting already has status banners, state-display helpers, timeline behavior, and expert-gated audit detail that should be hardened rather than rebuilt from scratch

## In Scope

- `apps/accounting/src/router/*`
- `apps/accounting/src/pages/*`
- Accounting workflow components and helpers
- controller queue and detail behavior
- controller action affordances and UX
- status banners, state messaging, and audit visibility
- Accounting-side cross-app routing to Admin
- related tests
- Accounting-side docs and readiness reporting

## Out of Scope

- backend lifecycle redesign
- provisioning saga redesign
- Admin recovery implementation
- requester/coordinator surface redesign outside boundary verification needs
- host, tenant, deployment, or security configuration work
- broad schema changes unless required for direct UI contract compatibility

## Evidence Discipline

Every prompt in this package must separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred implementation recommendation
- unresolved gap or ambiguity

If a prompt encounters ambiguity that depends on earlier-phase contract decisions, it must record that dependency explicitly instead of silently normalizing the behavior.

## Implementation Stages

### Stage 1 — Repo-Truth Accounting Surface Audit

Establish the exact live gap list in the Accounting app against current repo truth and the governing workflow/boundary references.

**Primary output**

- authoritative gap inventory for queue, detail, status, audit, and Admin-routing behavior

**Key focus**

- actual controller actions by state
- dead-end states
- wording drift versus current lifecycle behavior
- existing status/audit behavior that should be hardened rather than reinvented
- authority routing and stale-doc classification

### Stage 2 — Queue and Detail Workflow Completion

Complete queue/detail workflow behavior using the Prompt-01 inventory instead of generic completion assumptions.

**Primary output**

- corrected queue/detail controller flow with missing or misleading behavior removed

**Key focus**

- queue tabs, filters, and navigation continuity
- detail action visibility by state
- controller-safe affordances only
- no spillover into Admin recovery behavior

### Stage 3 — External Setup and Controller Handoff Completion

Resolve the `AwaitingExternalSetup` dead-end and any final controller-side handoff UX in a way that remains consistent with the frozen lifecycle contract.

**Primary output**

- complete external-setup exit path and contract-safe final controller handoff behavior

**Key focus**

- external setup completion path
- project-number capture and validation UX
- wording aligned to actual backend behavior
- no accidental invention of a separate launch model unless earlier-phase contract work explicitly changed it

### Stage 4 — Status Feedback, Audit Trail, and UX Hardening

Harden controller-facing operational confidence using the status, banner, timeline, and audit features already present in the surface.

**Primary output**

- clearer controller feedback and read-only audit visibility across normal, warning, and failure states

**Key focus**

- labels, banners, and state messaging
- history and audit visibility
- empty and error states
- controller-safe next-step guidance

### Stage 5 — Admin Routing and Boundary Verification

Verify that Accounting routes failed or exceptional cases correctly without absorbing Admin responsibilities.

**Primary output**

- clean Accounting-to-Admin routing with intact ownership boundaries

**Key focus**

- `Send to Admin` behavior
- URL generation and missing-target degradation
- no Admin recovery controls in Accounting
- doc alignment for boundary ownership

### Stage 6 — Final Documentation Reconciliation and Readiness Report

Reconcile the final implementation against current repo truth and produce the Phase 3 readiness closeout.

**Primary output**

- updated docs and final readiness report for later phases

**Key focus**

- repo-truth evidence
- closure statements
- remaining gaps or later-phase dependencies
- clear readiness recommendation

## Prompt Order

1. `Prompt-01_Phase-3-Repo-Truth-Accounting-Surface-Audit.md`
2. `Prompt-02_Phase-3-Queue-and-Detail-Workflow-Completion.md`
3. `Prompt-03_Phase-3-External-Setup-and-Launch-Action-Completion.md`
4. `Prompt-04_Phase-3-Status-Feedback-Audit-Trail-and-Controller-UX-Hardening.md`
5. `Prompt-05_Phase-3-Admin-Routing-and-Cross-App-Boundary-Verification.md`
6. `Prompt-06_Phase-3-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Acceptance Standard for the Phase

Phase 3 is complete only when all of the following are true:

- the Accounting queue and detail flow are complete for the controller role
- `AwaitingExternalSetup` is no longer a controller dead-end unless an earlier frozen contract explicitly preserves that limitation
- final controller-side wording is aligned with actual backend handoff behavior
- controller-facing status and audit context are operationally credible
- failure cases route cleanly to Admin without adding Admin actions to Accounting
- docs are updated to match repo truth and stale authority paths are classified
- a final readiness report exists stating what was completed, what remains, and whether the app is ready for later hardening phases
