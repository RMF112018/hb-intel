# 00 — Plan Summary

## Objective

Implement a **high-coverage, deterministic stress-test system** for the complete HB Kudos workflow and UX, spanning the employee/public webpart, the admin/companion governance webpart, the shared UI-kit seams, and the SharePoint list read/write/audit boundaries.

The output is not a demo suite. It is a **serious regression and workflow-integrity harness** meant to expose breakage across UI, state orchestration, visibility boundaries, data mapping, and hosted runtime behavior.

## Recommended strategy

- Use the existing **Playwright webparts harness** as the primary browser/E2E layer.
- Add deterministic **seed/fixture builders** for Kudos list rows and audit-event rows.
- Separate the problem into four workstreams:
  1. scenario/state matrix lock
  2. harness + deterministic data plumbing
  3. public/admin/shared seam coverage
  4. hosted validation + evidence + closure
- Treat workflow state, visibility mode, prominence mode, and governance-action history as **distinct axes**.
- Force every key mutation path to prove both:
  - UI transition correctness
  - data refresh / cache invalidation / audit-event correctness

## Strongest-fit test architecture

### Primary

- **Playwright** for browser-level UX, flow, focus, hosted behavior, screenshots, traces, and end-to-end state transitions.

### Secondary

- focused logic tests for pure helpers where doing so materially improves confidence:
  - scenario derivation helpers
  - visibility predicates
  - aging derivation
  - prominence validation behavior
  - patch-plan generation

### Why this fit is strongest

- The repo already has a Playwright webparts config and an `e2e/webparts` lane.
- The Kudos system is highly UI-driven and flyout/panel-heavy.
- The critical failures here are often **interaction + rendering + data-refresh + permission-boundary** failures, not just isolated logic failures.
- Traces, HTML reports, screenshots, and action-level artifacts are necessary for closure.

## Required workstreams

### Workstream 1 — Repo-truth scenario matrix

Lock the actual system state model from current code:

- 7-state workflow union
- overlay states
- action-driven transitions
- visibility modes
- prominence modes
- associated visibility
- reaction states
- composer lifecycle states
- hosted/runtime conditions

### Workstream 2 — Deterministic data and seed plumbing

Build deterministic fixtures for:

- public and non-public Kudos entries
- audit-event timelines
- recipient bucket combinations
- photo presence / absence
- claim / reassignment / admin review combinations
- prominence collisions
- approval / schedule / archive / aged-off combinations

### Workstream 3 — Surface coverage

Implement browser coverage for:

- public employee surface
- companion governance surface
- shared component seams

### Workstream 4 — Evidence and closure

Require:

- Playwright HTML report
- traces for failures and key path proofs
- screenshot set
- coverage map against scenario matrix
- defect register
- explicit closure summary with unresolved gaps

## Closure standard

The effort is complete only when all of the following are true:

- scenario matrix is committed and traceable to repo truth
- deterministic seed strategy exists and is reusable
- public surface coverage exists for composer, feed, detail, reaction, archive, photos, and discard flows
- companion coverage exists for review queue, filters, actions, audit timeline, bulk approve, and ownership behavior
- shared seams are validated for people search, person-photo hydration, contract mapping, and public/admin data boundaries
- hosted validation artifacts prove no dead CTA, no hidden critical UI, acceptable focus behavior, and acceptable panel scroll behavior
- closure package explicitly documents pass/fail and any remaining defects
