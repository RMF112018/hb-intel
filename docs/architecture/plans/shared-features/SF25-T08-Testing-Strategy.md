# SF25-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF25-T08 testing task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define fixture exports and scenario matrix for publish lifecycle correctness, offline replay, AI approval guardrails, BIC projection, supersession/revocation traceability, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/publish-workflow/testing`):
- `createMockPublishRequest(overrides?)`
- `createMockPublishReceiptState(overrides?)`
- `createMockPublishQueueState(overrides?)`
- `mockPublishWorkflowProfiles`

Adapters:
- `createMockBdPublishWorkflowView(overrides?)`
- `createMockEstimatingPublishWorkflowView(overrides?)`

Canonical scenarios:
1. readiness and approval transitions through publish state machine
2. supersession and revocation traceability paths
3. offline queue/replay and status indicators
4. inline AI suggestion citation/approval path
5. BIC avatar + My Work projection behavior
6. full panel visibility policy enforcement across all modes
7. acknowledgment pre/post-publish lifecycle paths
8. five KPI telemetry emission and trend refresh

---

## Unit Tests

- lifecycle transition guards and readiness rule outcomes
- approval/acknowledgment gate evaluation and policy enforcement
- queue replay ordering and conflict handling
- telemetry KPI schema validation and threshold metadata

---

## Hook/Component Tests

- hook loading/error/refresh/sync transitions
- panel/target-selector/checklist/receipt interactions
- supersession/revocation UI and state reconciliation
- AI approval gating and persisted output checks

---

## Storybook and Playwright

Storybook matrix:
- mode x publish-state x sync-state variants
- ownership and AI-action variants

Playwright flow:
1. user opens panel and completes readiness checks
2. publish request persists offline with `Saved locally`
3. queue replays on reconnect with `Queued to sync` then completion
4. supersession and acknowledgment paths finalize
5. receipt deep-links and KPI surfaces reflect final trace state

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

