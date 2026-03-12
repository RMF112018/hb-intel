# SF22-T03 - Autopsy Trigger and Lifecycle Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01, L-02, L-04, L-06, L-08 through L-14
**Estimated Effort:** 1.2 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF22-T03 trigger/lifecycle/storage task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define deterministic trigger conditions, multi-stage lifecycle semantics, governance transitions, persistence model, stale/revalidation behavior, and downstream publication gating.

---

## Trigger Contract

- trigger when pursuit status transitions to `Won`, `Lost`, or `No-Bid`
- create autopsy record + section-level BIC records in one transaction boundary
- assign primary/co-author roles and start 5-business-day SLA clock
- send immediate notifications to responsible users

---

## Lifecycle State Machine

Required transitions:

- `draft -> review -> approved -> published`
- `review -> draft` (changes requested)
- `approved -> review` (re-open)
- `published -> superseded` (newer validated autopsy)
- `superseded -> archived` (retention/archive policy)
- `any active -> overdue` (SLA breach path where applicable)

Governance requirements:
- disagreement records may block progression from review to approved
- publication requires gate checks (confidence/evidence/sensitivity)
- manual overrides require governance metadata and approval when policy demands

---

## Escalation Contract

- mark autopsy `overdue` when SLA window expires
- escalate to Chief Estimator while preserving section ownership
- persist escalation events for audit and notification de-duplication
- escalation paths exist for disagreement deadlock beyond overdue tracking

---

## Storage, Staleness, and Offline Contract

- persist drafts and transitions through `@hbc/versioned-record`
- use IndexedDB-backed queue for disconnected writes
- optimistic statuses: `Saved locally`, `Queued to sync`
- replay queue in deterministic order with immutable snapshots
- conflicts append new versions and require review
- stale intelligence detection flags published records requiring revalidation
- revalidation writes new version entries; prior published records remain immutable

---

## Publish Contracts

- only publishable autopsies emit downstream signals
- completed+approved outputs publish benchmark update signals for `@hbc/score-benchmark`
- approved findings seed `@hbc/strategic-intelligence` draft entries subject to sensitivity policy
- redacted projections are emitted where cross-module visibility is restricted

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy test -- trigger
pnpm --filter @hbc/post-bid-autopsy test -- lifecycle
pnpm --filter @hbc/post-bid-autopsy test -- governance
pnpm --filter @hbc/post-bid-autopsy test -- storage
pnpm --filter @hbc/post-bid-autopsy test -- sync
```
