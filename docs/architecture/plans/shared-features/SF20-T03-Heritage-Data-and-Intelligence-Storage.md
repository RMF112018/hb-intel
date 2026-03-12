# SF20-T03 - Strategic Intelligence Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01, L-02, L-03, L-04, L-06, L-08, L-09, L-10
**Estimated Effort:** 1.25 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF20-T03 lifecycle/storage task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define primitive-owned heritage/intelligence lifecycle, persistence semantics, handoff review/acknowledgment lifecycle, commitment lifecycle, stale-review/renewal flow, supersession/conflict semantics, and provenance-safe projection/indexing behavior.

---

## Heritage and Living Intelligence Lifecycle Contracts

- heritage read model resolves from handoff snapshot and remains immutable
- living intelligence entries are additive, versioned, and never overwrite prior approved history
- handoff review mode is tied to a specific heritage snapshot and tracked independently from living-entry approval lifecycle

---

## Commitment and Handoff Workflow Storage Contracts

- commitments persist as first-class records linked to snapshot/project context
- unresolved commitments may link to BIC records and My Work projection metadata
- participant acknowledgment records persist role + timestamp + status; completion is required for handoff workflow closure

---

## Trust, Recency, and Conflict Storage Contracts

- each entry stores reliability/provenance metadata and validation/review timestamps
- stale-state computation persists derived flags for query/read optimization
- supersession/contradiction relationships are explicit and versioned
- resolution notes are immutable append-only governance events

---

## Offline and Replay Contract

- local mutations persist via IndexedDB-backed queue using `@hbc/versioned-record`
- optimistic status projection is required (`Saved locally`, `Queued to sync`)
- background replay rehydrates queue in-order and preserves immutable version history
- conflicts create new versions; no destructive overwrite of approved records
- replay includes acknowledgment/commitment/conflict events with provenance metadata

---

## Projection and Indexing Contract

- approved entries are index-eligible subject to sensitivity/redaction policy
- pending/rejected entries excluded from searchable corpus
- redacted projections are emitted for cross-module consumers lacking full visibility rights
- suggestion payload generation uses normalized metadata and provenance-safe match factors

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence test -- storage
pnpm --filter @hbc/strategic-intelligence test -- api
pnpm --filter @hbc/strategic-intelligence test -- sync
pnpm --filter @hbc/strategic-intelligence test -- governance
```
