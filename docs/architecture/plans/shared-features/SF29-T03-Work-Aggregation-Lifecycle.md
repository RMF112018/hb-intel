# SF29-T03 - Work Aggregation Lifecycle

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-03 through L-10
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF29-T03 lifecycle task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define deterministic work aggregation, ranking, dedupe, supersession, and queue lifecycle behavior across all registered sources.

---

## Aggregation Contract

- all source adapters register through `MyWorkRegistry`
- registry bootstraps built-in adapters for BIC, workflow handoff, acknowledgment, notification-intelligence, and resumable drafts
- adapters return normalized candidate items plus source-health metadata
- aggregation pipeline order is:
  1. source eligibility check
  2. source load
  3. normalization
  4. dedupe
  5. supersession
  6. ranking
  7. group/count projection

---

## Queue Lifecycle Contract

- support `new -> active -> blocked | waiting | deferred -> completed`
- `superseded` items are removed from active lanes but retained in diagnostics and lineage
- partial-source failures must not clear unaffected urgent items
- item timestamps must preserve created, updated, viewed, deferred, and completion boundaries

---

## Ranking Contract

Ranking inputs are computed from:

- overdue state
- days-to-due threshold
- BIC urgency and blocked state
- unacknowledged handoff/approval state
- unread freshness
- dependency impact
- project context weighting
- source ranking weight
- offline capability of the next action

Ranking must remain deterministic for equal inputs. Tie-breaking order:

1. overdue severity
2. blocked criticality
3. source weight
4. freshest material update
5. stable lexical fallback on canonical key

---

## Dedupe Contract

- overlapping signals for the same actionable thing merge into one canonical item
- merged items retain all source traces and latest-source reason
- dedupe must not erase more urgent permission or blocker metadata
- duplicate suppression is auditable through telemetry and diagnostics

Examples:

- BIC transfer + immediate notification -> one merged item
- handoff receipt + related acknowledgment task -> one merged item
- stale watch notification + newer ownership transfer -> one active item with preserved lineage

---

## Supersession Contract

- newer canonical work may replace older lower-truth signals
- superseded items remain inspectable in Expert diagnostics and history
- supersession must always expose replacement linkage

Examples:

- watch signal superseded by active ownership transfer
- resumable draft superseded by live workflow action on the same record
- generic review task superseded by overdue blocker task on the same record

---

## Source-Health and Trust Contract

- feed state must expose `live`, `cached`, `partial`, and `queued` freshness semantics
- adapter failures remain isolated and diagnostics-visible
- queue must expose degraded source count, hidden superseded count, and queued local action count
- urgent counts continue from partial success when safe

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed test -- lifecycle
pnpm --filter @hbc/my-work-feed test -- ranking
pnpm --filter @hbc/my-work-feed test -- dedupe
pnpm --filter @hbc/my-work-feed test -- supersession
```
