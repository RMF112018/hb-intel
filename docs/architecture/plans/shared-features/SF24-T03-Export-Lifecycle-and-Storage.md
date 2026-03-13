# SF24-T03 - Export Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF24-T03 lifecycle/storage task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define deterministic export lifecycle transitions, receipt and replay semantics, naming/branding invariants, and governance-safe artifact traceability without silent loss of truth.

---

## Lifecycle Contract

- support simple table, current-view, record-snapshot, presentation, and composite-report intents through one primitive lifecycle
- preserve monotonic transitions across `saved-locally -> queued-to-sync -> rendering -> complete | failed`
- allow `restored-receipt` and `degraded` trust states without rewriting artifact history
- create BIC records for review/approval and handoff steps and project ownership avatars to menu/receipt and My Work
- surface top recommended export or follow-up action at each non-terminal phase
- enforce complexity-tier behavior through primitive policy gates without changing artifact truth

---

## Receipt Source Distinctions

The runtime must distinguish:

- local-only queued request
  - request exists locally, no remote artifact yet, user can review intent and retry rules
- remote rendering receipt
  - request acknowledged remotely, artifact not yet complete
- completed artifact receipt
  - artifact exists with immutable truth/context stamps
- restored receipt
  - prior request/receipt restored into active UI after reload or recovery
- stale or degraded receipt
  - receipt remains visible, but source truth changed materially or render quality/truth is downgraded

These distinctions must remain visible in progress and receipt surfaces.

---

## Storage and Offline Contract

- service worker caches export menu, composition surfaces, renderer assets, and receipt card
- export requests and receipt mutations persist through `@hbc/versioned-record` with IndexedDB backing
- `@hbc/session-state` owns local queue continuity, reconnect detection, and replay handoff
- disconnected requests enter deterministic Background Sync queue replay
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay completion appends immutable version snapshots with provenance metadata
- restored receipts preserve original request metadata across reload and reconnect

---

## Artifact Truth Contract

- every artifact includes record/view/version/user/time/format/file context stamps
- current-view exports must stamp applied filters, sort order, visible columns, and selected rows where applicable
- snapshot exports must stamp explicit version provenance
- file naming follows primitive-owned deterministic naming conventions
- branding templates are versioned and traceable per generated artifact
- checksum/hash metadata is retained for audit comparison where enabled
- source mismatch detection must surface when the underlying view or record changed materially before render completion

---

## Recovery, Retry, and Dismissal Contract

- failed renders must distinguish retryable, non-retryable, permission, and data-shape failures
- retry paths preserve prior request and receipt metadata
- restored receipts must preserve prior warnings and trust downgrades
- dismiss/clear behavior must be explicit, guarded, and non-destructive to audit evidence
- superseded or stale export attempts remain traceable even when newer artifacts exist

---

## Governance Contract

- export definitions support admin-approved configuration revisions with audit trail
- request generation, render completion, retry, dismissal, and re-download are auditable
- snapshot freeze is required for compliance or milestone circulation artifacts
- approval-state transitions require version history retention and traceability
- manual override or exceptional handling must remain visible, attributable, and non-destructive

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- lifecycle
pnpm --filter @hbc/export-runtime test -- storage
pnpm --filter @hbc/export-runtime test -- sync
pnpm --filter @hbc/export-runtime test -- governance
```
