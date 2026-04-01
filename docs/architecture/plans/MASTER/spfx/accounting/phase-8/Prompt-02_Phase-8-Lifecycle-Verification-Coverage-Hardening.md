# Prompt-02 — Phase 8 Lifecycle Verification Coverage Hardening

## Objective

Implement or complete the missing verification coverage required to prove the Project Setup lifecycle behaves correctly across core request, controller, approval-to-handoff, backend auto-start, provisioning progression, failure, and completion paths.

Use the audit output from:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for what exists.
- Keep lifecycle wording aligned to the frozen contract: approval → `ReadyToProvision` → backend auto-start → provisioning runtime progression.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- This is a verification-hardening prompt, not a broad feature-implementation prompt.
- Do not invent unsupported behavior just to satisfy tests.
- Prefer deterministic tests close to the business rules and route contracts.

## Required Coverage Focus

Using the Prompt-01 audit as input, harden verification coverage for:

- request submission and validation
- controller queue and detail actions
- required project-number capture on approval
- external setup gating behavior
- `ReadyToProvision` transition behavior
- backend auto-start guard behavior where current repo truth exposes it
- provisioning state transitions through completion and failure
- failure routing into Admin exception handling
- status / ownership / terminal-state visibility

## Required Source Review

At minimum, review and use the most relevant current sources among:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/estimating/src/test/NewRequestPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.completion.test.tsx`
- the current backend request-lifecycle / provisioning lifecycle / compensation tests identified from repo truth
- `packages/provisioning/src/t08-cross-contract-verification.test.ts`
- `packages/provisioning/src/t08-deferred-surface-tests.test.ts`

## Required Deliverable Updates

Update progress and evidence in:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

Be explicit about:

- what tests were added or updated
- what command(s) were run
- what passed
- what remains partial
- what remains environment-gated rather than repo-proven

## Hard Requirement

Do not use older loose wording such as “launch behavior” when the current repo truth is more specific. Use language such as:

- approval / handoff
- transition to `ReadyToProvision`
- backend auto-start
- provisioning runtime progression

## Completion Standard

This prompt is complete only when the highest-value lifecycle coverage gaps are either:

- repo-proven with updated test evidence, or
- explicitly classified as environment-gated / deferred with rationale

The prompt is not complete if it merely adds more tests without clarifying what is still not repo-proven.
