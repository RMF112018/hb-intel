# SF22-T03 - Autopsy Trigger and Lifecycle Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF22-T03 trigger/lifecycle/storage task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define deterministic trigger conditions, assignment/SLA rules, persistence model, and offline replay behavior for autopsy lifecycle.

---

## Trigger Contract

- trigger when pursuit status transitions to `Won`, `Lost`, or `No-Bid`
- create autopsy record + section-level BIC records in one transaction boundary
- assign primary/co-author roles and start 5-business-day SLA clock
- send immediate notifications to responsible users

---

## Escalation Contract

- mark autopsy `overdue` when SLA window expires
- escalate to Chief Estimator while preserving existing section ownership
- persist escalation events for audit and notification de-duplication

---

## Storage and Offline Contract

- persist drafts and transitions through `@hbc/versioned-record`
- use IndexedDB-backed queue for disconnected writes
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay queue in deterministic order with immutable version snapshots
- conflicts append new versions and require approver review

---

## Publish Contracts

- completed autopsies publish benchmark update signals for `@hbc/score-benchmark`
- approved section findings seed `@hbc/strategic-intelligence` draft entries
- only approved outputs flow to downstream indexed/reporting surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy test -- trigger
pnpm --filter @hbc/post-bid-autopsy test -- lifecycle
pnpm --filter @hbc/post-bid-autopsy test -- storage
pnpm --filter @hbc/post-bid-autopsy test -- sync
```
