# SF23-T03 - Record Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF23-T03 lifecycle/storage task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define deterministic record lifecycle transitions, recovery and replay semantics, and governance-safe versioning for authoring workflows without silent loss of evidence.

---

## Lifecycle Contract

- support `create`, `edit`, `duplicate`, `template`, and `review` as primitive lifecycle modes
- preserve monotonic transitions across `not-started -> draft -> dirty -> valid-with-warnings | blocked -> submitting -> submitted | failed`
- create BIC records for review/handoff steps and project ownership avatars to submit bar and My Work
- surface top recommended action and trust state at each non-terminal phase
- enforce complexity-tier behavior through primitive policy gates without changing lifecycle truth

---

## Draft Source Distinctions

The runtime must distinguish:

- local draft
  - draft persisted locally only; author can continue, compare, restore, or discard
- server draft
  - draft committed to active persistence adapter and available as remote truth
- restored draft
  - draft brought back into the active form session from local or remote recovery
- stale restored draft
  - recovered draft whose timestamp, version, or validation context requires explicit review before trust is restored

These distinctions must remain visible in recovery surfaces and audit traces.

---

## Storage and Offline Contract

- service worker caches record form shell, field renderer, review panel, submit bar, and recovery banner
- drafts and submission mutations persist through `@hbc/versioned-record` with IndexedDB backing
- `@hbc/session-state` owns local queue continuity, reconnect detection, and replay handoff
- disconnected writes enter deterministic Background Sync queue replay
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay completion appends immutable version snapshots with provenance metadata
- degraded or partial replay must not silently overwrite restored local work

---

## Recovery and Conflict Contract

- recovery must allow compare current vs saved draft before destructive restore
- restored drafts preserve prior validation metadata and warning context where still relevant
- stale-draft warnings must include timestamp/source and downgrade trust state to `recovered-needs-review`
- replay conflicts must preserve both local intent and server truth evidence
- retry, restore, discard, and re-open-review choices must all be explicit
- destructive discard actions require explicit confirmation and audit logging

---

## Governance Contract

- form definitions support admin-approved configuration revisions with audit trail
- save, restore, retry, submit, discard, replay, and conflict-resolution events are auditable
- submission updates require version history retention and approval-state traceability
- snapshot freeze is required for compliance or milestone handoff submissions
- manual override or exceptional handling must remain visible, attributable, and non-destructive

---

## Publish and Downstream Contracts

- approved submissions emit deep-link relationships via `@hbc/related-items`
- handoff ownership projections publish to `@hbc/project-canvas` My Work lane
- review-step status and reassignment metadata remain available to downstream consumers
- telemetry state emits stable KPI payloads for friction reduction, recovery success, and handoff latency

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- lifecycle
pnpm --filter @hbc/record-form test -- storage
pnpm --filter @hbc/record-form test -- sync
pnpm --filter @hbc/record-form test -- governance
```
