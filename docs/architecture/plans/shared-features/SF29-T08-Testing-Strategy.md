# SF29-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF29-T08 testing task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define fixtures, scenario matrix, and quality gates for deterministic prioritization, queue hygiene, explainability, offline continuity, and multi-surface consistency.

---

## Testing Exports (`@hbc/my-work-feed/testing`)

- `createMockMyWorkItem(overrides?)`
- `createMockMyWorkFeed(overrides?)`
- `createMockMyWorkRuntimeContext(overrides?)`
- `createMockMyWorkAdapter(overrides?)`
- `createMockMyWorkTeamScenario(overrides?)`
- `mockMyWorkScenarios`

Canonical scenarios:

1. overdue owned action
2. blocked action with dependency impact
3. unacknowledged inbound handoff
4. deduped BIC + notification merge
5. superseded watch item replaced by active ownership transfer
6. cached feed with last-sync indicator
7. replay-queued local action
8. delegated-by-me aging item
9. my-team escalation candidate
10. partial-source success with diagnostics visible

---

## Unit Tests

- deterministic ranking order for overdue, blocked, urgent, unread-fresh, and dependency-weight combinations
- dedupe merge logic preserves source traces and urgent actionability
- supersession logic preserves lineage and replacement linkage
- count semantics remain stable across priority lanes and grouping changes
- explainability payload construction for why-here, why-ranked, can/can't-act, and what-next
- telemetry event schema validation for queue-health and action metrics

---

## Hook and Component Tests

- hook transitions for loading, success, partial, cached, queued, and error states
- replay-safe mutation behavior and reconnect idempotency
- panel/feed/tile/team-feed count parity
- reason drawer disclosure and permission-state rendering
- complexity behavior by tier across launcher, panel, feed, tile, and team feed

---

## Storybook and Playwright

Storybook matrix:

- priority lane x complexity tier
- live/cached/partial queue-health state
- deduped/superseded variants
- personal vs team-feed projections

Playwright scenarios:

1. urgent item appears consistently in badge, panel, tile, and full feed
2. deduped item renders once with merged source traces
3. inline acknowledgment or defer action completes without module hopping where supported
4. offline cached feed appears with last-sync indicator
5. reconnect replays queued local mutations and refreshes counts
6. manager view shows aging delegated item without changing personal queue truth

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
