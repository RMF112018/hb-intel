# SF29-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01, L-03, L-06, L-07, L-08, L-09, L-10
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF29-T04 hooks task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define hook orchestration for personal feed, counts, panel projection, explainability, team oversight, and offline state without conflating UI-shell state with canonical work-item truth.

---

## Runtime Hooks

- `useMyWork`
  - loads personal feed items, queue health, last refresh state, and partial-source diagnostics
- `useMyWorkCounts`
  - computes canonical counts for badge, launcher, tile, panel, and feed summaries
- `useMyWorkPanel`
  - projects compact grouped queue state for shell-side panel usage
- `useMyWorkActions`
  - exposes replay-safe actions and deep-link fallbacks for non-inlineable workflows
- `useMyWorkReasoning`
  - resolves why-here, why-ranked, can/can't-act, and what-next payloads for drawer/detail usage
- `useMyWorkTeamFeed`
  - returns delegated-by-me, my-team, and escalation-candidate projections
- `useMyWorkOfflineState`
  - returns cached/live/partial state, last-sync time, queued local action count, and reconnect replay state

---

## Query Keys

- `['my-work', userId, 'feed', query]`
- `['my-work', userId, 'counts', query]`
- `['my-work', userId, 'panel', query]`
- `['my-work', userId, 'reasoning', itemId]`
- `['my-work', userId, 'team', ownerScope, query]`
- `['my-work', userId, 'offline']`

---

## State Boundaries

- TanStack Query owns remote retrieval, freshness, invalidation, and cache persistence
- package-local UI store owns panel open state, grouping choice, and transient disclosure state only
- `@hbc/session-state` owns connectivity, replay queue persistence, and reconnect execution
- hooks must return stable shapes across loading, success, partial, cached, and error states

---

## Mutation Contract

Replay-safe inline mutations:

- `mark-read`
- `defer`
- `undefer`
- `pin-today`
- `pin-this-week`
- `mark-waiting-on`
- `add-note-to-self`

Non-replay-safe or source-owned actions:

- must deep-link or invoke source-owned mutation flows
- must clearly report `cannotReplayOffline` when connectivity is unavailable

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed test -- hooks
pnpm --filter @hbc/my-work-feed test -- query
pnpm --filter @hbc/my-work-feed test -- offline
pnpm --filter @hbc/my-work-feed check-types
```
