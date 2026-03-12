# SF23-T03 - Record Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF23-T03 lifecycle/storage task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define deterministic record lifecycle transitions, persistence and replay semantics, and governance-safe versioning for form submissions.

---

## Lifecycle Contract

- support `create`, `edit`, `duplicate`, and `template-from-existing` as primitive lifecycle modes
- preserve monotonic transitions across `draft -> ready-for-review -> submitted` with failure recovery
- create BIC records for review/handoff steps and project ownership avatars to submit bar and My Work
- enforce complexity-tier behavior through primitive policy gates

---

## Storage and Offline Contract

- service worker caches record form shell, field renderer, review panel, submit bar, and recovery banner
- drafts and submission mutations persist through `@hbc/versioned-record` with IndexedDB backing
- disconnected writes enter deterministic Background Sync queue replay
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay completion appends immutable version snapshots with provenance metadata

---

## Governance Contract

- form definitions support admin-approved configuration revisions with audit trail
- submission updates require version history retention and approval-state traceability
- check-in/check-out style edit protection and approval controls are documented at primitive boundary
- snapshot freeze is required for compliance or milestone handoff submissions

---

## Publish Contracts

- approved submissions emit deep-link relationships via `@hbc/related-items`
- handoff ownership projections publish to `@hbc/project-canvas` My Work lane
- telemetry state emits stable KPI payloads for role-aware dashboard surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- lifecycle
pnpm --filter @hbc/record-form test -- storage
pnpm --filter @hbc/record-form test -- sync
pnpm --filter @hbc/record-form test -- governance
```
