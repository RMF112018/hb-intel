# ADR-0094 — `@hbc/versioned-record` as Platform Primitive

**Date:** 2026-03-08
**Status:** Accepted
**Deciders:** HB Intel Architecture Team
**Technical Story:** SF06 — Shared Feature: Versioned Record

---

## Context

Multiple HB Intel record types undergo meaningful revisions over their lifecycle.
The Go/No-Go Scorecard, Project Management Plan, active pursuit estimates, and
Living Strategic Intelligence contributions are all records that change substantially
between creation and final approval. Without a structured versioning system:

- No way to compare current state to a prior snapshot
- Approvals reference "the current version" but that version may change after approval
- Audit trail questions ("what did this look like when the Director approved it?")
  cannot be answered
- Rolling back to a prior state requires manual reconstruction

The construction industry's legal context (contract disputes, change order
documentation, bid protest risk) makes immutable version history a business and
legal necessity, not merely a UX enhancement.

---

## Decision 1 — Full JSON Snapshots (vs. delta storage)

**Chosen:** Store a complete serialized copy of the record's data shape at every
version point. A v3 snapshot is fully self-contained and independently restorable
without reconstruction chains.

**Rejected:** Delta/diff storage — stores only field-level changes between
consecutive versions. Rejected because:
- Restore requires replaying all deltas from v1 forward (O(n) operation)
- Chain corruption risk: a missing delta breaks all subsequent restores
- Unacceptable for a legal-record use case

**Rejected:** Hybrid (full snapshots at milestones, deltas between) — rejected
because it doubles the implementation surface and still carries delta-chain
corruption risk for interim drafts.

**Consequences:** Storage grows with record size × version count. Mitigated by
the 255KB file-library overflow strategy (Decision 2) and by `maxVersions`
configuration for non-legal record types.

---

## Decision 2 — Transparent Inline/File-Library Routing at 255KB

**Chosen:** `VersionApi` manages the 255KB threshold internally. Payloads ≤255KB
are stored inline in the `HbcVersionSnapshots` SP list column. Payloads >255KB
are stored as JSON files in the SP file library at
`Shared Documents/System/Snapshots/{recordType}/{recordId}/{snapshotId}.json`.
The `SnapshotJson` column stores either the inline JSON or a `ref:` URI.
All callers interact with a single uniform API surface.

**Rejected:** Explicit `storageClass` config field — places infrastructure
knowledge burden on every consuming module author.

**Rejected:** Always use file library — penalizes the common case (small records)
with two round-trips per read.

**Consequences:** `VersionApi` must handle two internal read paths. Partial-failure
scenario (list row saved, file write fails) produces an orphaned file reference.
Compensating transaction: if the file write fails, the list row is not written.
Orphaned files (file write succeeded, list row write failed) are inert and cleaned
up by the maintenance runbook.

---

## Decision 3 — Append-Only Rollback with Superseded Tag

**Chosen:** Rollback creates a new snapshot whose payload is a copy of the target
version. Versions between the rollback target and the current state are tagged
`'superseded'` and soft-hidden behind a "Show archived versions" toggle in
`HbcVersionHistory`. Nothing is ever deleted.

**Rejected:** Truncation (delete versions after target) — permanently destroys
legally significant records. Non-starter for any record type in this system.

**Consequences:** A new `'superseded'` tag value was added to the `VersionTag`
union, distinct from `'archived'` (which is a workflow terminal state). Version
list grows with rollback events; the UI toggle keeps the default view clean.

---

## Decision 4 — Client-Side Diff Engine

**Chosen:** Field-level diff is computed as a pure function in
`src/engine/diffEngine.ts`. Both snapshots are fetched client-side; diff runs
in a deferred `useEffect` to avoid main-thread blocking.

**Rejected:** Server-side Azure Function diff — adds backend deployment surface
area. Not justified given `HbcVersionDiff` is PWA-only (per spec) and diff
computation is already constrained to resource-capable browser environments.

**Rejected:** Hybrid (client/server based on payload size) — doubles the code
paths and requires `VersionApi` to expose internal storage metadata.

**Consequences:** Large nested record diffs may produce visible computation delay.
Mitigated by the `isComputing` loading state and the `setTimeout(fn, 0)` deferral
pattern in `useVersionDiff`.

---

## Decision 5 — Metadata-First Version List Loading

**Chosen:** `useVersionHistory` fetches all version metadata rows (no `SnapshotJson`
payload) in a single lightweight SP list query. Full snapshot payloads are loaded
on demand when a user selects a version for diff or restore.

**Rejected:** Eager load all snapshots — wasteful; the `SnapshotJson` column is
large and unnecessary for the version list display.

**Rejected:** Fixed-page pagination — disrupts the continuous timeline UX and
complicates tag/author filtering.

---

## Decision 6 — Notification Integration via `getStakeholders` Config Function

**Chosen:** `IVersionedRecordConfig<T>` includes a required `getStakeholders`
function. `VersionApi.createSnapshot()` calls `NotificationApi.send()` once per
stakeholder after a successful write. The package registers the `version.created`
event type with `NotificationRegistry` at module initialization.

**Rejected:** Callback delegation (onVersionCreated calls send) — notification
discipline depends on every consuming module implementing the callback. No
platform-level guarantee.

**Consequences:** `@hbc/versioned-record` has a peer dependency on
`@hbc/notification-intelligence`. This is already established by the SF10 platform
registration pattern; it is not an incremental coupling cost.

---

## References

- SF06 spec: `docs/explanation/feature-decisions/PH7-SF-06-Shared-Feature-Versioned-Record.md`
- SF10 notification spec: `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
- SF04 acknowledgment spec: `docs/explanation/feature-decisions/PH7-SF-04-Shared-Feature-Acknowledgment.md`
- SF05 step-wizard spec: `docs/explanation/feature-decisions/PH7-SF-05-Shared-Feature-Step-Wizard.md`
