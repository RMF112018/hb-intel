# SF18-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF18-T08 testing task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define fixtures, scenario matrix, and quality gates for primitive-backed readiness behavior, offline replay, and KPI emission.

---

## Testing Exports (`@hbc/features-estimating/testing`)

- `createMockHealthIndicatorState(overrides?)`
- `createMockBidReadinessProfile(overrides?)`
- `createMockEstimatingPursuitForReadiness(overrides?)`
- `mockBidReadinessStates`

Canonical states:

1. ready (no blockers)
2. nearly-ready (no blockers)
3. attention-needed (blockers present)
4. not-ready (low score + blockers)
5. overdue attention-needed
6. due-within-48h with blockers
7. saved-locally optimistic state
8. queued-to-sync replay-pending state

---

## Unit Tests

- deterministic weighted score mapping from primitive outputs
- blockers-first ordering and ownership projection
- status boundary mapping for all threshold edges
- profile override validation and version metadata integrity
- telemetry event shape for five KPI outputs

---

## Component and Hook Tests

- `useBidReadiness`, `useBidReadinessProfile`, `useBidReadinessTelemetry` transitions
- Signal and Dashboard complexity behavior by tier
- Checklist ordering, deep-links, avatars, and AI action approval gating
- optimistic UI indicator transitions (`Saved locally`, `Queued to sync`)
- sync replay idempotency after reconnect

---

## Storybook and Playwright

Storybook matrix:

- status x complexity tier
- blocker/no-blocker
- sync status (`synced`, `saved-locally`, `queued-to-sync`)

Playwright scenarios:

1. criterion completion improves status and score projection
2. blocker introduction downgrades state and routes My Work item
3. inline AI suggestion requires approval before mutation
4. offline action shows optimistic badge and replays on reconnect
5. KPI events are emitted and visible in telemetry consumer stubs

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
