# @hbc/versioned-record

Immutable version history and change audit trail primitive for the HB Intel platform.

## Overview

`@hbc/versioned-record` provides full JSON snapshot versioning, a client-side diff engine, complexity-gated UI components, and a SharePoint/Azure Functions storage backend. It is the platform primitive for any record type that requires auditability, rollback, or approval-referenced snapshots.

**Locked ADR:** ADR-0094 — `docs/architecture/adr/ADR-0094-versioned-record-platform-primitive.md`

---

## Installation

This package is internal to the HB Intel monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@hbc/versioned-record": "workspace:*"
  }
}
```

---

## Quick Start

```typescript
import type { IVersionedRecordConfig } from '@hbc/versioned-record';
import { VersionApi, useVersionHistory, HbcVersionHistory, HbcVersionBadge } from '@hbc/versioned-record';

// 1. Declare a config for your record type
const scorecardVersionConfig: IVersionedRecordConfig<IBdScorecard> = {
  recordType: 'bd-scorecard',
  maxVersions: 50,
  getStakeholders: (record) => [
    { userId: record.ownerId, role: 'Owner' },
    { userId: record.directorId, role: 'Director' },
  ],
  resolveDisplayLabel: (record) => `${record.projectName} Scorecard`,
};

// 2. Create a snapshot at meaningful lifecycle moments
await VersionApi.createSnapshot({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  snapshot: scorecard,
  config: scorecardVersionConfig,
  tag: 'submitted',
  actorUserId: currentUser.id,
});

// 3. Render the history panel
<HbcVersionHistory
  recordType="bd-scorecard"
  recordId={scorecard.id}
  config={scorecardVersionConfig}
  allowRollback={currentUser.role === 'Director of Preconstruction'}
  currentUser={currentUser}
  onRollback={() => void refetchScorecard()}
/>

// 4. Render the badge in the record header
<HbcVersionBadge
  currentVersion={scorecard.currentVersion}
  currentTag={scorecard.currentVersionTag}
  onClick={() => setVersionPanelOpen(true)}
/>
```

---

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `IVersionedRecordConfig<T>` | Interface | Per-record-type configuration |
| `IVersionedRecord<T>` | Interface | A single version entry with snapshot and metadata |
| `IVersionMetadata` | Interface | Metadata-only record (no snapshot payload) |
| `IVersionDiff` | Interface | Field-level change between two snapshots |
| `VersionTag` | Union type | `'draft' \| 'submitted' \| 'approved' \| 'rejected' \| 'handoff' \| 'imported' \| 'superseded'` |
| `VersionApi` | Object | `createSnapshot`, `getMetadataList`, `getSnapshotById`, `restoreSnapshot` |
| `useVersionHistory` | Hook | Loads metadata list; metadata-first, payload on-demand |
| `useVersionSnapshot` | Hook | On-demand snapshot fetch with cancellation safety |
| `useVersionDiff` | Hook | Deferred client-side diff computation |
| `HbcVersionHistory` | Component | Chronological version list with rollback CTA (complexity-gated) |
| `HbcVersionDiff` | Component | Side-by-side and unified diff viewer — **PWA only** (D-08) |
| `HbcVersionBadge` | Component | Inline tag badge for record headers — SPFx-compatible |
| `VERSION_TAG_COLORS` | Constant | Color class map per `VersionTag` |
| `SNAPSHOT_INLINE_MAX_BYTES` | Constant | `255_000` — inline/file-library routing threshold (D-02) |

### Testing Sub-Path

```typescript
import {
  createMockVersionedRecordConfig,
  multiVersionState,
  mockUseVersionHistory,
  createVersionedRecordWrapper,
} from '@hbc/versioned-record/testing';
```

> **Note:** The `testing/` sub-path is excluded from the production bundle (`sideEffects: false`). Import only in test files.

---

## Architecture Boundaries

This package **must not** import from:

- `@hbc/field-annotations` — no annotation primitives in version layer
- `@hbc/workflow-handoff` — consuming module calls `createSnapshot()` with `tag: 'handoff'`; this package doesn't know about handoff
- Any `packages/features/*` module

`@hbc/notification-intelligence` integration uses the `NotificationRegistry` pattern: `NotificationRegistry.register()` is called at module load in `VersionApi.ts` — the package does not call notification APIs directly.

---

## SPFx Constraints

- `HbcVersionBadge` and `HbcVersionHistory` are SPFx-compatible via `@hbc/ui-kit/app-shell`
- `HbcVersionDiff` is **PWA-only** — do not render in SPFx webpart contexts (D-08)
- Import from `@hbc/ui-kit/app-shell` for SPFx-constrained surfaces

---

## Storage (D-01 + D-02)

| Payload Size | Storage Location |
|-------------|-----------------|
| ≤ 255 KB | Inline in `HbcVersionSnapshots` SharePoint list column (`SnapshotJson`) |
| > 255 KB | JSON file in `Shared Documents/System/Snapshots/{recordType}/{recordId}/{snapshotId}.json`; `SnapshotJson` stores a `ref:` URI |

All callers use the same `VersionApi` surface — the routing is transparent.

---

## Related Plans & References

- `docs/architecture/plans/shared-features/SF06-Versioned-Record.md` — Master plan
- `docs/architecture/plans/shared-features/SF06-T02-TypeScript-Contracts.md` — Full type definitions
- `docs/architecture/plans/shared-features/SF06-T03-Diff-Engine.md` — Diff engine implementation
- `docs/architecture/plans/shared-features/SF06-T07-Storage-and-Integration.md` — SharePoint schema & Azure Functions
- `docs/how-to/developer/versioned-record-adoption-guide.md` — Step-by-step wiring guide
- `docs/architecture/adr/ADR-0094-versioned-record-platform-primitive.md` — Locked ADR
