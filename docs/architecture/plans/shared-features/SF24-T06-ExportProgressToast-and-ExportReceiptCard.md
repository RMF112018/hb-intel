# SF24-T06 - ExportProgressToast and ExportReceiptCard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-03, L-04, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF24-T06 progress/receipt task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define progress and receipt contracts for lifecycle feedback, artifact traceability, receipt trust, offline resume safety, retry guidance, and expert-level context stamping.

---

## `ExportProgressToast`

Behavior:

- projects lifecycle transitions for `saved-locally`, `queued-to-sync`, `rendering`, `complete`, `failed`, `degraded`, and `restored-receipt` states
- links to artifact receipt when available
- displays deterministic replay status during reconnect recovery
- exposes retry guidance when failure state is retryable

Explainability requirements:

- clarify whether the visible state reflects a local-only request, remote render in progress, completed artifact, degraded artifact, or restored receipt
- explain why rendering failed or was deferred
- explain whether the current export should be retried, re-exported, reviewed, or handed off

---

## `ExportReceiptCard`

Behavior:

- shows artifact metadata and immutable context stamps:
  - record
  - view
  - version
  - filters
  - sort order
  - visible columns or selected rows when applicable
  - user
  - time
  - format
  - file name
- projects BIC ownership avatars and downstream My Work handoff metadata
- includes deep-links to related records, approvals, and follow-up tasks
- supports recent export recall and safe re-download flows

Trust and explainability requirements:

- explains what the artifact actually represents
- distinguishes snapshot truth from current-view truth
- marks degraded or restored receipts with explicit trust downgrade language
- surfaces stale-receipt treatment when source truth changed materially after request or before render completion
- makes clear/dismiss behavior explicit and guarded

Offline semantics:

- deterministic queue replay and conflict-safe recovery
- visible status states: `Saved locally`, `Queued to sync`
- restored receipts preserve prior request metadata, warnings, and retryability state

---

## Admin Configuration Contracts

- naming convention templates remain admin-configurable with audited revisions
- branding template versions and approval-state policy remain traceable
- receipt retention and visibility rules honor governance constraints
- exception handling for missing sections or partial composition remains visible and auditable

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- ExportProgressToast
pnpm --filter @hbc/export-runtime test -- ExportReceiptCard
pnpm --filter @hbc/export-runtime test -- receipts
pnpm --filter @hbc/export-runtime test -- approvals
```
