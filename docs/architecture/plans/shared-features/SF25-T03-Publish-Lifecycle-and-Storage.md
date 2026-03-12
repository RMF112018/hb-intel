# SF25-T03 - Publish Lifecycle and Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF25-T03 lifecycle/storage task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define deterministic publish lifecycle transitions, readiness/approval/supersession/revocation semantics, persistence and replay behavior, and governance-safe receipt traceability.

---

## Lifecycle Contract

- support deterministic transitions across `draft -> ready-for-review -> approved-for-publish -> publishing -> published`
- support controlled side paths for `superseded`, `revoked`, and `failed` states
- create BIC records for readiness, approval, supersession, revocation, and acknowledgment steps
- enforce full panel visibility policy independent of complexity mode

---

## Readiness and Approval Contract

- readiness checks must evaluate artifact availability, metadata, target completeness, and issue-label/version readiness
- approval rules must support role-based gates and optional acknowledgment prerequisites
- supersession warnings and revocation rationale are first-class policy gates
- publish execution is blocked until deterministic readiness and approval criteria pass

---

## Storage and Offline Contract

- service worker caches panel/checklist/receipt surfaces and required workflow assets
- publish requests and receipt mutations persist through `@hbc/versioned-record` with IndexedDB backing
- disconnected publish actions enter deterministic Background Sync queue replay
- optimistic statuses must be emitted: `Saved locally`, `Queued to sync`
- replay completion appends immutable version snapshots with provenance metadata

---

## Governance Contract

- every publish state transition is auditable with actor/time/version metadata
- supersession chains and revocation reasons are retained as immutable trace records
- approval-state transitions and acknowledgments must be queryable from receipt history
- snapshot freeze metadata is required at publish and supersession boundaries

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow test -- lifecycle
pnpm --filter @hbc/publish-workflow test -- readiness
pnpm --filter @hbc/publish-workflow test -- approvals
pnpm --filter @hbc/publish-workflow test -- sync
```

