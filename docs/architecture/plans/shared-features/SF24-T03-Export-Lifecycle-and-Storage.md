# SF24-T03 - Export Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF24-T03 lifecycle/storage task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define deterministic export lifecycle transitions, persistence and replay semantics, naming/branding invariants, and governance-safe artifact traceability.

---

## Lifecycle Contract

- support table and report export intents through a single primitive lifecycle
- preserve monotonic transitions across `queued -> rendering -> complete/failed`
- create BIC records for review/approval and handoff steps and project ownership avatars to menu/receipt and My Work
- enforce complexity-tier behavior through primitive policy gates

---

## Storage and Offline Contract

- service worker caches export menu, composition surfaces, renderer assets, and receipt card
- export requests and receipt mutations persist through `@hbc/versioned-record` with IndexedDB backing
- disconnected requests enter deterministic Background Sync queue replay
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay completion appends immutable version snapshots with provenance metadata

---

## Artifact Truth Contract

- every artifact includes record/view/version/user/time/format/file context stamp
- file naming follows primitive-owned deterministic naming conventions
- branding templates are versioned and traceable per generated artifact
- checksum/hash metadata is retained for audit comparison where enabled

---

## Governance Contract

- export definitions support admin-approved configuration revisions with audit trail
- approval-state transitions require version history retention and traceability
- snapshot freeze is required for compliance or milestone circulation artifacts
- check-in/check-out and approval controls are documented at primitive boundary

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- lifecycle
pnpm --filter @hbc/export-runtime test -- storage
pnpm --filter @hbc/export-runtime test -- sync
pnpm --filter @hbc/export-runtime test -- governance
```

