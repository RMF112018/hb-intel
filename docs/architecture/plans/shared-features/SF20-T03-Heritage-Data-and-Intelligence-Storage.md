# SF20-T03 - Strategic Intelligence Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF20-T03 lifecycle/storage task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define primitive-owned heritage/intelligence lifecycle, persistence semantics, approval queue APIs, and provenance-safe indexing behavior.

---

## Heritage Source Contract

- heritage read model resolves from workflow-handoff snapshot and versioned scorecard context
- handoff context remains immutable while intelligence entries evolve as additive versioned records
- cross-module consumers receive read-only heritage projection model

---

## Intelligence Storage Contract

- entries store contributor, approver, approval status, BIC link, and version metadata
- attachment references are stored as external links; provenance stays in versioned record stream
- rejected entries keep rejection reason and allow revision-based resubmission

---

## Offline and Replay Contract

- local mutations persist via IndexedDB-backed queue using `@hbc/versioned-record`
- optimistic status projection is required (`Saved locally`, `Queued to sync`)
- background replay rehydrates queue in-order and preserves immutable version history
- conflicts create new versions; no destructive overwrite of approved records

---

## Search Indexing Contract

- approved entries only emitted to indexing pipeline
- pending/rejected entries excluded from searchable corpus
- heritage-provenance identifiers retained for audit traceability

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence test -- storage
pnpm --filter @hbc/strategic-intelligence test -- api
pnpm --filter @hbc/strategic-intelligence test -- sync
```
